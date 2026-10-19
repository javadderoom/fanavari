import * as XLSX from 'xlsx';

export type ColumnRole = 
  | 'question' 
  | 'option_a' 
  | 'option_b' 
  | 'option_c' 
  | 'option_d' 
  | 'correct_answer' 
  | 'metadata' 
  | 'ignore';

export interface ExamColumn {
  id: string;
  originalName: string;
  displayName: string;
  role: ColumnRole;
  enabled: boolean;
}

export interface ExamOption {
  id: string; // 'a', 'b', 'c', 'd'
  label: string; // 'الف', 'ب', 'ج', 'د'
  text: string;
  isCorrect: boolean;
  originalIndex?: number;
}

export interface ExamQuestion {
  id: string;
  questionNumber: number;
  originalRowIndex: number;
  text: string;
  options: ExamOption[];
  correctOptionLabel: string; // e.g. 'الف' | 'ب' | 'ج' | 'د'
  metadata: Record<string, any>;
}

export interface ExamAnswerKeyItem {
  questionNumber: number;
  correctLabel: string;
  correctText: string;
}

export type SelectionMode = 'all' | 'first_n' | 'random_n';

export interface ExamParseOptions {
  selectionMode?: SelectionMode;
  questionCount?: number;
  filterColumnId?: string;
  filterValue?: string;
  shuffleOptions?: boolean;
  seed?: number;
}

export interface ExamHeaderConfig {
  schoolName: string;
  examTitle: string;
  subject: string;
  gradeAndMajor: string;
  examSession: string; // e.g. نوبت اول / نوبت دوم / خرداد
  examDate: string;
  durationMinutes: string;
  studentFields: {
    showName: boolean;
    showClass: boolean;
    showSeatNumber: boolean;
    showScoreBox: boolean;
  };
  customNotice: string;
}

export interface ExamLayoutConfig {
  columns: 1 | 2;
  fontSize: 'sm' | 'base' | 'lg';
  spacing: 'compact' | 'normal' | 'spacious';
  showAnswerKey: boolean;
  showOptionLetters: boolean;
}

/**
 * Converts English digits to Persian digits for clean typography.
 */
export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return str.replace(/[0-9]/g, (w) => persianDigits[parseInt(w, 10)]);
}

/**
 * Option labels in Persian:
 * Index 0 -> الف
 * Index 1 -> ب
 * Index 2 -> ج
 * Index 3 -> د
 */
export const PERSIAN_OPTION_LETTERS = ['الف', 'ب', 'ج', 'د', 'هـ', 'و'];

/**
 * Parses an Excel (.xlsx, .xls) buffer or CSV string into raw tabular data.
 */
export function parseRawTable(
  input: ArrayBuffer | Uint8Array | string
): { headers: string[]; rows: Record<string, any>[] } {
  let workbook: XLSX.WorkBook;

  if (typeof input === 'string') {
    // CSV or TSV string
    workbook = XLSX.read(input, { type: 'string', raw: true });
  } else {
    // ArrayBuffer / Uint8Array
    workbook = XLSX.read(new Uint8Array(input), { type: 'array', raw: true });
  }

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    return { headers: [], rows: [] };
  }

  const sheet = workbook.Sheets[firstSheetName];
  // Convert sheet to array of arrays first to inspect headers cleanly
  const rawMatrix: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

  if (rawMatrix.length === 0) {
    return { headers: [], rows: [] };
  }

  // Find header row (first row with at least 2 non-empty cells)
  let headerRowIndex = 0;
  for (let i = 0; i < Math.min(rawMatrix.length, 5); i++) {
    const filledCells = rawMatrix[i].filter((c) => c !== undefined && c !== null && String(c).trim() !== '');
    if (filledCells.length >= 2) {
      headerRowIndex = i;
      break;
    }
  }

  const rawHeaderRow = rawMatrix[headerRowIndex] || [];
  const headers: string[] = rawHeaderRow.map((cell, idx) => {
    const val = String(cell || '').trim();
    return val || `ستون_${idx + 1}`;
  });

  // Ensure unique headers
  const uniqueHeaders: string[] = [];
  const seenHeaders = new Set<string>();
  headers.forEach((h, idx) => {
    let finalHeader = h;
    let counter = 2;
    while (seenHeaders.has(finalHeader)) {
      finalHeader = `${h}_${counter++}`;
    }
    seenHeaders.add(finalHeader);
    uniqueHeaders.push(finalHeader);
  });

  const rows: Record<string, any>[] = [];
  for (let i = headerRowIndex + 1; i < rawMatrix.length; i++) {
    const rowCells = rawMatrix[i];
    if (!rowCells || rowCells.every((c) => c === undefined || c === null || String(c).trim() === '')) {
      continue; // Skip completely empty rows
    }

    const rowObj: Record<string, any> = {};
    uniqueHeaders.forEach((header, idx) => {
      const cellVal = rowCells[idx];
      rowObj[header] = cellVal !== undefined && cellVal !== null ? String(cellVal).trim() : '';
    });
    rows.push(rowObj);
  }

  return { headers: uniqueHeaders, rows };
}

/**
 * Heuristically auto-detects roles for columns based on their Persian / English header names.
 */
export function autoDetectColumnRoles(headers: string[]): ExamColumn[] {
  let hasQuestion = false;
  let hasOptionA = false;
  let hasOptionB = false;
  let hasOptionC = false;
  let hasOptionD = false;
  let hasCorrectAnswer = false;

  return headers.map((origName, index) => {
    const name = origName.trim().toLowerCase();
    const id = `col_${index}_${origName.replace(/\s+/g, '_')}`;
    let role: ColumnRole = 'metadata';

    if (
      !hasQuestion &&
      (name.includes('سوال') || name.includes('متن سوال') || name.includes('پرسش') || name.includes('question'))
    ) {
      role = 'question';
      hasQuestion = true;
    } else if (
      !hasCorrectAnswer &&
      (name.includes('جواب درست') || name.includes('پاسخ صحیح') || name.includes('کلید') || name.includes('پاسخ درست') || name === 'answer')
    ) {
      // In many datasets (including the user's sample), the column is labeled 'جواب درست'
      // By default it acts as Option A (and correct answer)
      role = 'correct_answer';
      hasCorrectAnswer = true;
    } else if (
      !hasOptionA &&
      (name === 'الف' || name === 'گزینه الف' || name === 'گزینه 1' || name === 'گزینه ۱' || name === 'a' || name === 'option a')
    ) {
      role = 'option_a';
      hasOptionA = true;
    } else if (
      !hasOptionB &&
      (name === 'ب' || name === 'گزینه ب' || name === 'گزینه 2' || name === 'گزینه ۲' || name === 'b' || name === 'option b')
    ) {
      role = 'option_b';
      hasOptionB = true;
    } else if (
      !hasOptionC &&
      (name === 'ج' || name === 'گزینه ج' || name === 'گزینه 3' || name === 'گزینه ۳' || name === 'c' || name === 'option c')
    ) {
      role = 'option_c';
      hasOptionC = true;
    } else if (
      !hasOptionD &&
      (name === 'د' || name === 'گزینه د' || name === 'گزینه 4' || name === 'گزینه ۴' || name === 'd' || name === 'option d')
    ) {
      role = 'option_d';
      hasOptionD = true;
    } else if (
      name.includes('نوبت') || name.includes('پایه') || name.includes('کلاس') || name.includes('فصل') || name.includes('درس')
    ) {
      role = 'metadata';
    }

    return {
      id,
      originalName: origName,
      displayName: origName,
      role,
      enabled: true,
    };
  });
}

/**
 * Deterministic or pseudo-random pseudo-shuffler.
 */
function seededShuffle<T>(array: T[], seed = 42): T[] {
  const result = [...array];
  let currentSeed = seed;
  const nextRandom = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(nextRandom() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Builds the final structured exam question list according to user column mappings and extraction rules.
 */
export function buildExamQuestions(
  rows: Record<string, any>[],
  columns: ExamColumn[],
  options: ExamParseOptions = {}
): {
  questions: ExamQuestion[];
  answerKey: ExamAnswerKeyItem[];
  totalAvailable: number;
} {
  const enabledColumns = columns.filter((col) => col.enabled && col.role !== 'ignore');

  const questionCol = enabledColumns.find((c) => c.role === 'question');
  const correctCol = enabledColumns.find((c) => c.role === 'correct_answer');
  const optACol = enabledColumns.find((c) => c.role === 'option_a');
  const optBCol = enabledColumns.find((c) => c.role === 'option_b');
  const optCCol = enabledColumns.find((c) => c.role === 'option_c');
  const optDCol = enabledColumns.find((c) => c.role === 'option_d');
  const metaCols = enabledColumns.filter((c) => c.role === 'metadata');

  // Filter rows if requested
  let filteredRows = [...rows];
  if (options.filterColumnId && options.filterValue !== undefined && options.filterValue !== '') {
    const filterCol = columns.find((c) => c.id === options.filterColumnId);
    if (filterCol) {
      filteredRows = filteredRows.filter((row) => {
        const val = String(row[filterCol.originalName] || '').trim();
        return val === String(options.filterValue).trim();
      });
    }
  }

  // Filter out rows without question text
  if (questionCol) {
    filteredRows = filteredRows.filter((row) => {
      const qText = String(row[questionCol.originalName] || '').trim();
      return qText.length > 0;
    });
  }

  const totalAvailable = filteredRows.length;

  // Apply row selection mode
  const { selectionMode = 'all', questionCount, shuffleOptions = false, seed = 1234 } = options;
  let selectedRows = [...filteredRows];

  if (selectionMode === 'first_n' && questionCount && questionCount > 0) {
    selectedRows = selectedRows.slice(0, questionCount);
  } else if (selectionMode === 'random_n' && questionCount && questionCount > 0) {
    selectedRows = seededShuffle(selectedRows, seed).slice(0, Math.min(questionCount, selectedRows.length));
  }

  const questions: ExamQuestion[] = [];
  const answerKey: ExamAnswerKeyItem[] = [];

  selectedRows.forEach((row, idx) => {
    const questionNumber = idx + 1;
    const questionText = questionCol ? String(row[questionCol.originalName] || '').trim() : `سوال شماره ${idx + 1}`;

    // Collect options
    // Notice: If correctCol exists and optACol is absent, correctCol acts as Option 1 (and correct)
    const rawOptions: Array<{ text: string; isCorrect: boolean; originalIndex: number }> = [];

    if (correctCol && !optACol) {
      const cVal = String(row[correctCol.originalName] || '').trim();
      if (cVal) rawOptions.push({ text: cVal, isCorrect: true, originalIndex: 0 });
    } else if (optACol) {
      const aVal = String(row[optACol.originalName] || '').trim();
      const isCorrect = correctCol ? aVal === String(row[correctCol.originalName] || '').trim() : false;
      if (aVal) rawOptions.push({ text: aVal, isCorrect, originalIndex: 0 });
    }

    if (optBCol) {
      const bVal = String(row[optBCol.originalName] || '').trim();
      const isCorrect = correctCol ? bVal === String(row[correctCol.originalName] || '').trim() : false;
      if (bVal) rawOptions.push({ text: bVal, isCorrect, originalIndex: 1 });
    }

    if (optCCol) {
      const cVal = String(row[optCCol.originalName] || '').trim();
      const isCorrect = correctCol ? cVal === String(row[correctCol.originalName] || '').trim() : false;
      if (cVal) rawOptions.push({ text: cVal, isCorrect, originalIndex: 2 });
    }

    if (optDCol) {
      const dVal = String(row[optDCol.originalName] || '').trim();
      const isCorrect = correctCol ? dVal === String(row[correctCol.originalName] || '').trim() : false;
      if (dVal) rawOptions.push({ text: dVal, isCorrect, originalIndex: 3 });
    }

    // If options need to be shuffled so that Option A is not always correct:
    let orderedOptions = [...rawOptions];
    if (shuffleOptions && orderedOptions.length > 1) {
      // Use question-specific seed so each question gets shuffled independently but reproducibly
      const qSeed = (seed + idx * 7919) % 2147483647;
      orderedOptions = seededShuffle(orderedOptions, qSeed);
    }

    // Assign Persian labels
    let correctLabel = '';
    let correctText = '';
    const finalOptions: ExamOption[] = orderedOptions.map((opt, optIdx) => {
      const label = PERSIAN_OPTION_LETTERS[optIdx] || `${optIdx + 1}`;
      if (opt.isCorrect) {
        correctLabel = label;
        correctText = opt.text;
      }
      return {
        id: `opt_${optIdx}`,
        label,
        text: opt.text,
        isCorrect: opt.isCorrect,
        originalIndex: opt.originalIndex,
      };
    });

    // Metadata
    const metadata: Record<string, any> = {};
    metaCols.forEach((mCol) => {
      metadata[mCol.displayName || mCol.originalName] = row[mCol.originalName];
    });

    questions.push({
      id: `q_${questionNumber}`,
      questionNumber,
      originalRowIndex: idx,
      text: questionText,
      options: finalOptions,
      correctOptionLabel: correctLabel || 'الف',
      metadata,
    });

    if (correctLabel) {
      answerKey.push({
        questionNumber,
        correctLabel,
        correctText,
      });
    }
  });

  return {
    questions,
    answerKey,
    totalAvailable,
  };
}

/**
 * Sample dataset containing the user's prayer questions in CSV format.
 */
export const SAMPLE_EXAM_CSV = `متن سوال,جواب درست,ب,ج ,د,نوبت امتحان
"اگر بخواهیم نماز خواندن را به یک قله صعود تشبیه کنیم، مقدمات و شرایط نماز چه نقشی دارند؟",تجهیزات و آمادگی‌های لازم برای شروع حرکت,رسیدن به قله نماز,استراحت در طول مسیر صعود,پایان سفر معنوی,1
"کدام یک از موارد زیر از «شرایط صحت» نماز است، نه «شرایط وجوب»؟",طهارت داشتن (وضو یا غسل یا تیمم),بالغ بودن,عاقل بودن,هوشیار بودن,1
"اگر دانش‌آموزی در مکان غصبی با علم و عمد نماز بخواند، حکم نماز او چیست؟",نماز باطل است و باید دوباره در مکان مباح بخواند,نماز صحیح است ولی گناه کرده است,اگر توبه کند نمازش پذیرفته می‌شود,نماز صحیح است و نیازی به اعاده نیست,1
"پوشش واجب برای نمازگزار پسر یا مرد در حال نماز شامل کدام محدوده است؟",پوشاندن عورتین (شرمگاه),از ناف تا زانو,تمام بدن به جز صورت و دست‌ها,فقط پوشاندن بالا تنه,1
"لباس نمازگزار باید چه ویژگی‌ای از نظر نجاست داشته باشد؟",باید کاملاً پاک باشد و حتی مقدار کمی خون نامعفو نداشته باشد,اگر نجس باشد ولی متوجه نشود اشکال ندارد,نجاست لباس فقط در مسجد اشکال دارد,مهم پاک بودن دل است و نجاست لباس مانع نیست,1
"جهت قبله مسلمانان در حال حاضر کدام است و در ابتدا چه مکانی قبله بود؟",کعبه در مکه - بیت‌المقدس در فلسطین,بیت‌المقدس - مدینه منوره,کعبه - مشهد مقدس,مسجدالنبی - کعبه,1
"اگر فردی بدون تحقیق و در حالی که می‌توانست جهت قبله را بپرسد، به سمتی نماز بخواند و بعداً بفهمد اشتباه بوده، حکمش چیست؟",باید نماز را در صورت باقی بودن وقت، دوباره بخواند,نمازش کاملاً صحیح است و قضا ندارد,فقط باید استغفار کند,نیازی به اعاده نیست و نماز قبول است,1
"اذان شامل چند بند است و هدف اصلی از گفتن آن چیست؟",۱۸ بند - اعلام وقت نماز و دعوت به عبادت,۱۵ بند - فقط کسب ثواب فردی,۲۰ بند - آمادگی برای ذکر دعا,۱۷ بند - پایان وقت استراحت,1
"تفاوت اصلی «اذان» و «اقامه» در چیست؟",اقامه بلافاصله قبل از شروع نماز خوانده می‌شود و جمله «قد قامت الصلاه» دارد,اذان جملات کمتری نسبت به اقامه دارد,اقامه فقط برای نماز جمعه مستحب است,اذان بعد از نماز گفته می‌شود و اقامه قبل از نماز,1
"اگر نمازگزاری شک کند که وقت نماز داخل شده یا نه، آیا می‌تواند نماز را شروع کند؟",خیر، باید یقین پیدا کند یا دو شاهد عادل اذان بگویند,بله، نیت کردن بر اساس احتمال مانعی ندارد,فقط در نمازهای ظهر و عصر جایز است,بله، اگر بعداً معلوم شود وقت بوده صحیح است,1
"«نیت» در نماز چه جایگاهی دارد و آیا باید به زبان آورده شود؟",رکن نماز است و لازم نیست به زبان بیاید، بلکه انگیزه قلبی برای تقرب به خدا کافی است,از واجبات غیر رکنی است و باید حتماً به زبان خوانده شود,مستحب مؤکد است و نگفتن آن ضرری نمی‌زند,فقط حضور در نماز جماعت نیت محسوب می‌شود,2
"«تکبیرة‌الاحرام» یعنی چه و چرا به این نام خوانده شده است؟",گفتن «الله‌اکبر» در آغاز نماز که کارهای منافی نماز را بر نمازگزار حرام می‌کند,بلند گفتن تکبیر در تمام رکعت‌ها,صلوات فرستادن بعد از اتمام حمد,دعای قنوت که احکام ویژه‌ای دارد,2
"اگر نمازگزار تکبیرة‌الاحرام را فراموش کند و به رکوع برود، وضعیت نمازش چیست؟",نماز باطل است و باید دوباره از ابتدا بخواند,نماز صحیح است و بعد از پایان دو سجده سهو بجا می‌آورد,فقط ثواب نماز کم می‌شود ولی اعاده ندارد,کافی است برگردد و تکبیر را بگوید,2
"تفاوت «واجبات رکنی» با «واجبات غیر رکنی» در چیست؟",رکن چه عمداً و چه سهواً کم یا زیاد شود نماز باطل است، اما غیر رکن اگر سهواً کم یا زیاد شود نماز صحیح است,غیر رکن اگر عمداً ترک شود اشکالی ندارد,واجبات رکنی فقط در نمازهای واجب وجود دارند,رکن فقط شامل حرکات بدنی است نه اذکار,2
"کدام مورد از واجبات غیر رکنی نماز است؟",ذکر تشهد و سلام,قیام متصل به رکوع,نیت,دو سجده در هر رکعت,2
"در رکعت سوم و چهارم، نمازگزار مخیر بین خواندن چه چیزهایی است؟",یک بار تسبیحات اربعه یا سوره حمد,حمد و سوره توحید,فقط تسبیحات اربعه به صورت ۳ بار,دعای فرج یا آیت‌الکرسی,2
"آرامش بدن (استقرار و طمأنینه) در هنگام قرائت اذکار نماز چه حکمی دارد؟",واجب است و در حین حرکت نباید ذکر واجب خوانده شود,مستحب است و بهتر است رعایت شود,فقط در حال سجده واجب است,تنها در نماز جماعت لازم است,2
"اگر کسی در نماز به جای رکوع، مستقیم به سجده برود و قبل از سجده متوجه شود، وظیفه‌اش چیست؟",باید بایستد و سپس به رکوع برود و نماز را ادامه دهد,باید نماز را قطع کند و از نو بخواند,نمازش صحیح است و بعد از نماز سجده سهو می‌گذارد,همان جا در حالت سجده ذکر رکوع را بگوید,2
"حداقل مقدار واجب برای خم شدن در رکوع چیست؟",به قدری که دست‌ها به زانوها برسد,تا جایی که کمر کاملاً صاف شود,خم شدن اندک به سمت پایین کافی است,تا جایی که سر در امتداد زانو قرار گیرد,2
"ذکر سجده چیست و چه تعداد سجده در هر رکعت واجب رکنی است؟",سبحان ربی الاعلی و بحمده - مجموع دو سجده رکن است,سبحان ربی العظیم و بحمده - یک سجده رکن است,الله اکبر - هر دو سجده مستحب است,سبحان الله - سجده اول رکن و دومی غیر رکن است,2
"کدام عمل مبطل نماز نیست؟",حرکت اندک انگشتان یا جابجایی مختصر دست بدون به هم خوردن صورت نماز,خندیدن با صدا (قهقهه) حتی اگر غیر عمدی باشد,گریه کردن با صدا برای امور دنیوی,حرف زدن عمدی حتی به اندازه یک کلمه دو حرفی,3
"اگر کسی عمداً در نماز سلام دهد در حالی که هنوز رکعت آخر را تمام نکرده، نمازش چه حکمی دارد؟",نماز باطل است,نماز صحیح است و رکعت را ادامه می‌دهد,باید سجده سهو انجام دهد,فقط کفاره روزه بر او واجب می‌شود,3
"شک در رکعت‌های کدام نمازها موجب باطل شدن نماز می‌شود؟",نمازهای دو رکعتی (صبح و مسافر) و نماز سه رکعتی (مغرب),فقط نماز جمعه,نمازهای چهار رکعتی,شک در هیچ نمازی آن را باطل نمی‌کند,3
"شک بین رکعت ۳ و ۴ در نماز چهار رکعتی بعد از سر برداشتن از سجده دوم چه تکلیفی دارد؟",بنا را بر ۴ می‌گذارد، نماز را تمام می‌کند و یک رکعت نماز احتیاط ایستاده می‌خواند,نماز را بلافاصله باطل اعلام کرده و دوباره می‌خواند,بنا را بر ۳ می‌گذارد و رکعت چهارم را می‌خواند,دو سجده سهو بجا می‌آورد و نمازش تمام است,3
"نماز احتیاط چگونه خوانده می‌شود؟",آهسته و بدون سوره، فقط با حمد و تکبیر و رکوع و سجود و تشهد و سلام,دقیقاً مانند یک رکعت نماز صبح با حمد و سوره و قنوت,با صدای بلند و همراه با دعای جوشن کبیر,بدون تشهد و فقط با یک سجده,3
"سجده سهو برای چه مواردی واجب می‌شود؟",سلام بی‌جا، حرف زدن سهوی، فراموشی یک سجده یا تشهد,خنده با صدای بلند,خوردن آب در حین نماز,کم کردن رکوع به صورت سهوی,3
"کیفیت انجام سجده سهو چگونه است؟",دو سجده پشت سر هم بعد از سلام نماز با ذکر مخصوص، سپس تشهد و سلام,یک رکوع و دو سجده قبل از سلام نماز,دو سجده با ذکر صلوات در روز جمعه,قرائت سوره حمد و اخلاص در حالت نشسته,3
"مهم‌ترین اثر فردی و روحی برپایی مداوم نماز بر طبق آیه شریفه «إِنَّ الصَّلَاةَ تَنْهَىٰ عَنِ الْفَحْشَاءِ وَالْمُنكَرِ» چیست؟",بازدارندگی از گناهان و پرورش پاکی و تقوا,کسب شهرت اجتماعی در بین همکاران,افزایش دارایی مادی بدون تلاش,درمان بیماری‌های جسمی مزمن,3
"نماز جماعت چه مزیتی بر نماز فرادی دارد؟",پاداش و ثواب آن فراتر از شمارش فرشتگان است و روح همبستگی ایجاد می‌کند,وقت کمتری نسبت به نماز فرادی می‌گیرد,هیچ شرط طهارتی برای مأمومین لازم نیست,تنها برای افراد مسن توصیه شده است,3
"وظیفه مأموم در رکعت اول و دوم نماز جماعت نسبت به خواندن حمد و سوره چیست؟",نباید حمد و سوره را بخواند بلکه باید سکوت کند و گوش فرا دهد,باید حمد و سوره را آهسته بخواند,باید حمد و سوره را بلندتر از امام بخواند,اختیار دارد که بخواند یا نخواند,3`;
