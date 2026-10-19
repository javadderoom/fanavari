import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  parseRawTable,
  autoDetectColumnRoles,
  buildExamQuestions,
  toPersianDigits,
  SAMPLE_EXAM_CSV,
  ExamColumn,
} from '../src/lib/exam-parser';

test('toPersianDigits converts western digits accurately', () => {
  assert.equal(toPersianDigits('1234567890'), '۱۲۳۴۵۶۷۸۹۰');
  assert.equal(toPersianDigits('سوال 15 از 30'), 'سوال ۱۵ از ۳۰');
  assert.equal(toPersianDigits(null), '');
});

test('parseRawTable correctly parses sample CSV data', () => {
  const result = parseRawTable(SAMPLE_EXAM_CSV);
  assert.ok(result.headers.length >= 6);
  assert.equal(result.headers[0], 'متن سوال');
  assert.equal(result.headers[1], 'جواب درست');
  assert.equal(result.rows.length, 30);
});

test('autoDetectColumnRoles properly assigns question, correct answer, and options', () => {
  const headers = ['متن سوال', 'جواب درست', 'ب', 'ج ', 'د', 'نوبت امتحان'];
  const cols = autoDetectColumnRoles(headers);

  assert.equal(cols[0].role, 'question');
  assert.equal(cols[1].role, 'correct_answer');
  assert.equal(cols[2].role, 'option_b');
  assert.equal(cols[3].role, 'option_c');
  assert.equal(cols[4].role, 'option_d');
  assert.equal(cols[5].role, 'metadata');
});

test('buildExamQuestions respects row count limiting (first_n and random_n)', () => {
  const { headers, rows } = parseRawTable(SAMPLE_EXAM_CSV);
  const cols = autoDetectColumnRoles(headers);

  // First 5
  const first5 = buildExamQuestions(rows, cols, {
    selectionMode: 'first_n',
    questionCount: 5,
  });
  assert.equal(first5.questions.length, 5);
  assert.equal(first5.totalAvailable, 30);
  assert.equal(first5.questions[0].questionNumber, 1);
  assert.equal(first5.questions[4].questionNumber, 5);

  // Random 10
  const random10 = buildExamQuestions(rows, cols, {
    selectionMode: 'random_n',
    questionCount: 10,
    seed: 42,
  });
  assert.equal(random10.questions.length, 10);
});

test('buildExamQuestions supports column renaming and complete column deletion', () => {
  const { headers, rows } = parseRawTable(SAMPLE_EXAM_CSV);
  const cols = autoDetectColumnRoles(headers);

  // Rename a column display name
  const metaCol = cols.find((c) => c.originalName === 'نوبت امتحان');
  assert.ok(metaCol);
  metaCol.displayName = 'دوره ارزیابی';

  const res1 = buildExamQuestions(rows, cols, {
    selectionMode: 'first_n',
    questionCount: 2,
  });
  assert.ok(res1.questions[0].metadata['دوره ارزیابی']);

  // Completely delete / disable a column (requirement: یک ستون رو کامل حذف کنم)
  metaCol.enabled = false;
  const res2 = buildExamQuestions(rows, cols, {
    selectionMode: 'first_n',
    questionCount: 2,
  });
  assert.equal(res2.questions[0].metadata['دوره ارزیابی'], undefined);
});

test('buildExamQuestions filters by column value (e.g. نوبت امتحان = 1)', () => {
  const { headers, rows } = parseRawTable(SAMPLE_EXAM_CSV);
  const cols = autoDetectColumnRoles(headers);
  const nobatCol = cols.find((c) => c.originalName === 'نوبت امتحان');
  assert.ok(nobatCol);

  const filtered = buildExamQuestions(rows, cols, {
    filterColumnId: nobatCol.id,
    filterValue: '1',
    selectionMode: 'all',
  });

  assert.equal(filtered.totalAvailable, 10);
  assert.equal(filtered.questions.length, 10);
  filtered.questions.forEach((q) => {
    assert.equal(q.metadata['نوبت امتحان'], '1');
  });
});

test('buildExamQuestions generates accurate answer key with and without option shuffling', () => {
  const { headers, rows } = parseRawTable(SAMPLE_EXAM_CSV);
  const cols = autoDetectColumnRoles(headers);

  // Without shuffle: Option A (الف) is always correct because column 2 is 'جواب درست'
  const unshuffled = buildExamQuestions(rows, cols, {
    selectionMode: 'first_n',
    questionCount: 5,
    shuffleOptions: false,
  });

  unshuffled.questions.forEach((q, idx) => {
    assert.equal(q.correctOptionLabel, 'الف');
    assert.equal(q.options[0].isCorrect, true);
    assert.equal(unshuffled.answerKey[idx].correctLabel, 'الف');
  });

  // With shuffle: options are randomized, but answerKey accurately points to whichever letter the correct option landed on
  const shuffled = buildExamQuestions(rows, cols, {
    selectionMode: 'first_n',
    questionCount: 10,
    shuffleOptions: true,
    seed: 999,
  });

  shuffled.questions.forEach((q, idx) => {
    const keyItem = shuffled.answerKey[idx];
    assert.equal(keyItem.questionNumber, q.questionNumber);
    assert.equal(keyItem.correctLabel, q.correctOptionLabel);

    // Verify option with isCorrect = true actually has label == correctOptionLabel
    const correctOpt = q.options.find((o) => o.isCorrect);
    assert.ok(correctOpt);
    assert.equal(correctOpt.label, q.correctOptionLabel);
    assert.equal(correctOpt.text, keyItem.correctText);
  });
});
