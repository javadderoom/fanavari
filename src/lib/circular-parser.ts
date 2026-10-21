/**
 * Circular / Announcement to Process Parser Engine
 *
 * Ingests semi-structured administrative announcements (e.g. from Bale/Telegram channels
 * like @Fanavari_Setad) and converts them into structured, interconnected SOP process models.
 */

export interface ParsedStepDraft {
  orderIndex: number;
  title: string;
  targetMenuPath: string;
  contentMarkdown: string;
  stepType: 'action' | 'decision' | 'warning' | 'end';
}

export interface ParsedProcessDraft {
  title: string;
  slug?: string;
  targetSystem: string;
  targetUrl?: string;
  audience?: string;
  sourceChannel?: string;
  circularDate?: string;
  description: string;
  category: string;
  scope: string;
  departmentName?: string;
  steps: ParsedStepDraft[];
  nextProcessDraftIndex?: number;
  nextProcessNote?: string;
  isPublished?: boolean;
}

export interface ParsedCircularResult {
  isMultiStage: boolean;
  metadata: {
    targetSystem: string;
    audience: string;
    subject: string;
    circularDate: string;
    sourceChannel: string;
    targetUrl?: string;
  };
  processes: ParsedProcessDraft[];
}

/**
 * Synthesizes clear operational instructions (دستورالعمل اجرایی و شرح تفصیلی گام)
 * without redundantly repeating the menu clicks already captured in targetMenuPath.
 */
function buildStepContentMarkdown(clicks: string[], notes: string[]): string {
  const parts: string[] = [];
  const lastClick = clicks.length > 0 ? clicks[clicks.length - 1] : '';

  // 1. Action guidance derived from the target destination / action click
  if (/^(\+|\*?\+\*?|ایجاد|جدید|افزودن|ثبت)/.test(lastClick)) {
    parts.push(`با مراجعه به مسیر منوی فوق در سامانه، گزینه **«${lastClick}»** را انتخاب نموده و فرم مربوطه را تکمیل و ثبت نمایید.`);
  } else if (/تایید|تأیید|ارسال|اعتبارسنجی|مجوز/.test(lastClick)) {
    parts.push(`از طریق مسیر منوی فوق وارد بخش مربوطه شده و اطلاعات را بررسی و اقدام لازم جهت **«${lastClick}»** را انجام دهید.`);
  } else if (/گزارش|مشاهده|لیست|کارنامه|فهرست/.test(lastClick)) {
    parts.push(`از طریق مسیر منوی فوق وارد بخش مربوطه شده و اطلاعات و گزارش‌های **«${lastClick}»** را بررسی نمایید.`);
  } else if (lastClick) {
    parts.push(`مطابق مسیر منوی مشخص‌شده در سامانه، وارد بخش **«${lastClick}»** شده و اقدام اجرایی لازم را ثبت و ذخیره نمایید.`);
  } else {
    parts.push('مطابق مسیر منوی مشخص‌شده، اقدام اجرایی لازم در سامانه را انجام دهید.');
  }

  // 2. Format actual circular notes, conditions, and prerequisites (if any)
  const cleanNotes = Array.from(
    new Set(
      notes
        .map((n) => n.replace(/^[📌🔻⚠️*#\s]+/, '').replace(/[*_]/g, '').trim())
        .filter((n) => n.length > 0 && !n.startsWith('مراحل جهت') && !n.startsWith('مرکز توسعه'))
    )
  );

  if (cleanNotes.length > 0) {
    parts.push('> **نکات و راهنمای تکمیلی:**\n' + cleanNotes.map((n) => `> - ${n}`).join('\n'));
  }

  return parts.join('\n\n');
}

/**
 * Normalizes Persian and Arabic text strings, removing zero-width artifacts
 * while preserving valid ZWNJ (نیم‌فاصله) where needed.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[\u200B\u200D\uFEFF]/g, '')
    .trim();
}

/**
 * Cleans leading emojis, navigation arrows, variation selectors, and numbered list prefixes.
 */
export function cleanStepLine(line: string): string {
  return line
    .replace(/^(?:[\u2B05\u25C0\u27A1\u25B6\uD83D\uDD39\uD83D\uDD38\u25AA\u25AB\uFE0F\uFE0E⬅️◀️➡️▶️🔹🔸▪️▫️]|\d+[\.\-])+\s*/u, '')
    .replace(/^\*\+\*/, '+')
    .replace(/[*_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Parses raw circular text into single or multi-stage linked process drafts.
 */
export function parseCircularToProcesses(rawText: string): ParsedCircularResult {
  const normalized = normalizeText(rawText);

  // 1. Extract Target System
  const systemMatch = normalized.match(/#\s*سامانه\s*:\s*([^\n\*]+)/i);
  let rawSystem = systemMatch ? systemMatch[1].trim().replace(/^[*#\s]+|[*#\s]+$/g, '') : 'سامانه سازمانی';
  let targetSystemClean = rawSystem;
  if (/سیدا/i.test(rawSystem)) {
    targetSystemClean = 'سیدا';
  } else if (/مای مدیو|my\.medu\.ir/i.test(rawSystem)) {
    targetSystemClean = 'پنجره واحد (my.medu.ir)';
  }

  // 2. Extract Audience
  const audienceMatch = normalized.match(/#\s*مخاطب\s*:\s*([^\n\*]+)/i);
  const rawAudience = audienceMatch ? audienceMatch[1].trim().replace(/^[*#\s]+|[*#\s]+$/g, '') : '';

  // 3. Extract Subject / Topic
  const subjectMatch = normalized.match(/#\s*موضوع\s*:\s*([\s\S]*?)(?=(?:📌|⭕️|⬅️|◀️|مرکز توسعه|درگاه|$))/i);
  let rawSubject = '';
  if (subjectMatch) {
    rawSubject = subjectMatch[1]
      .replace(/[*💢#]/g, '')
      .replace(/بصورت زیر میسر می‌باشد\.?/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  if (!rawSubject) {
    rawSubject = 'فرایند برگرفته از بخشنامه سامانه';
  }

  // 4. Extract Date
  const dateMatch = normalized.match(/تاریخ\s*:\s*([0-9\/\u06F0-\u06F9]+)/i);
  const circularDate = dateMatch ? dateMatch[1].trim() : '';

  // 5. Extract Source Channel
  const channelMatch = normalized.match(/@([a-zA-Z0-9_]+)/i);
  const sourceChannel = channelMatch ? `@${channelMatch[1]}` : '';

  // 6. Extract Target URL
  let targetUrl: string | undefined = undefined;
  const urlMatch = normalized.match(/(?:🌐|https?:\/\/|آدرس\s*:?\s*)([a-zA-Z0-9.\-_]+\.[a-zA-Z]{2,})/i);
  if (urlMatch) {
    const domain = urlMatch[1].toLowerCase();
    targetUrl = domain.startsWith('http') ? domain : `https://${domain}`;
  } else if (/my\.medu\.ir/i.test(normalized)) {
    targetUrl = 'https://my.medu.ir';
  }

  // Helper: Parse steps and intermediate transition notes
  // Each line with a directional arrow/bullet in the text parses into ONE CLICK in targetMenuPath.
  // Distinct step headings (e.g. گام ۱:, مرحله ۲:) create separate steps if present;
  // otherwise all clicks in the action section are unified into a single clean step.
  const parseActionSteps = (
    contentBlock: string,
    defaultStepTitle: string = 'مراحل اقدام در سامانه'
  ): { steps: ParsedStepDraft[]; transitionNote?: string } => {
    const lines = contentBlock.split('\n');
    const steps: ParsedStepDraft[] = [];
    let transitionNote: string | undefined = undefined;

    interface ClickGroup {
      title: string;
      clicks: string[];
      notes: string[];
    }

    const groups: ClickGroup[] = [];
    let currentGroup: ClickGroup = {
      title: defaultStepTitle,
      clicks: [],
      notes: [],
    };

    const stepHeadingRegex = /^(?:\*|⭕️|📌)*\s*(?:گام|مرحله)\s*(?:[۰-۹\d]+|اول|دوم|سوم|چهارم|پنجم|ششم)\s*[:؛-]?\s*(.*)/;

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Detect transition / administrative prerequisite notes
      if (/^[🔻]\s*(.+)$/.test(line) || /^پس از ثبت درخواست[،\s]/.test(line)) {
        const cleanNote = line.replace(/^[🔻*\s]+/, '').replace(/[*_]/g, '').trim();
        transitionNote = cleanNote;
        currentGroup.notes.push(cleanNote);
        continue;
      }

      // Check for footer bounds
      if (
        /^(?:مرکز توسعه|آدرس کانال|درگاه خدمات|🗓|تاریخ:|🌐|🆔)/.test(line) ||
        line.startsWith('🖥️')
      ) {
        break;
      }

      // Check for explicit sub-step headings (e.g. "گام ۱: ورود به سامانه")
      const headingMatch = line.match(stepHeadingRegex);
      if (headingMatch) {
        // If current group already has clicks, flush it
        if (currentGroup.clicks.length > 0) {
          groups.push(currentGroup);
        }
        const headingTitle = line.replace(/[*_]/g, '').replace(/^[⭕️📌\s]+/, '').trim();
        currentGroup = {
          title: headingTitle || defaultStepTitle,
          clicks: [],
          notes: [],
        };
        continue;
      }

      // Check if line indicates a workflow action click
      const hasStepIndicator = /^(?:[\u2B05\u25C0\u27A1\u25B6\uD83D\uDD39\uD83D\uDD38\u25AA\u25AB\uFE0F\uFE0E⬅️◀️➡️▶️🔹🔸▪️▫️]|\d+[\.\-])+\s*/u.test(line);
      if (hasStepIndicator) {
        const cleanText = cleanStepLine(line);
        if (cleanText) {
          currentGroup.clicks.push(cleanText);
        }
      } else {
        // Collect instructional / contextual notes from the circular (ignore metadata headers)
        const cleanNote = line.replace(/^[📌⚠️*#\s]+/, '').replace(/[*_]/g, '').trim();
        if (
          cleanNote &&
          !line.startsWith('#') &&
          !line.startsWith('*#') &&
          !cleanNote.startsWith('سامانه:') &&
          !cleanNote.startsWith('موضوع:') &&
          !cleanNote.startsWith('مخاطب:') &&
          !cleanNote.startsWith('مراحل جهت') &&
          !cleanNote.startsWith('مرکز توسعه')
        ) {
          currentGroup.notes.push(cleanNote);
        }
      }
    }

    // Flush the final group
    if (currentGroup.clicks.length > 0) {
      groups.push(currentGroup);
    }

    // Convert each group of clicks into a single step
    groups
      .filter((group) => group.clicks.length > 0)
      .forEach((group, idx) => {
        const menuPath = group.clicks.join(' > ');
        const instructions = buildStepContentMarkdown(group.clicks, group.notes);

        steps.push({
          orderIndex: idx + 1,
          title: group.title,
          targetMenuPath: menuPath,
          contentMarkdown: instructions,
          stepType: 'action',
        });
      });

    return { steps, transitionNote };
  };

  // 7. Detect Multi-Stage / Multi-Audience Workflows
  // Matches section headers such as:
  // "⭕️مراحل جهت مشاهده و اقدام در مدرسه مبدأ؛"
  // "⭕️مراحل جهت مشاهده و اقدام در مدرسه مقصد؛"
  // "مراحل جهت اقدام در مبدأ"
  const sectionRegex = /(?:[⭕️📌*]*\s*مراحل جهت مشاهده و اقدام(?: در\s*([^؛\n\*]+))?[؛\n\*]*)/gi;

  interface SectionInfo {
    label: string;
    startIndex: number;
    headerLength: number;
  }

  const foundSections: SectionInfo[] = [];
  let sMatch: RegExpExecArray | null;
  while ((sMatch = sectionRegex.exec(normalized)) !== null) {
    foundSections.push({
      label: sMatch[1] ? sMatch[1].trim().replace(/^در\s+/, '') : '',
      startIndex: sMatch.index,
      headerLength: sMatch[0].length,
    });
  }

  const metadata = {
    targetSystem: targetSystemClean,
    audience: rawAudience,
    subject: rawSubject,
    circularDate,
    sourceChannel,
    targetUrl,
  };

  // CASE A: Multi-Stage Workflows (e.g. Origin School -> Destination School)
  if (foundSections.length > 1) {
    const drafts: ParsedProcessDraft[] = [];
    const preSectionText = normalized.slice(0, foundSections[0].startIndex);

    for (let i = 0; i < foundSections.length; i++) {
      const current = foundSections[i];
      const nextStart = i + 1 < foundSections.length ? foundSections[i + 1].startIndex : normalized.length;
      const sectionContent = normalized.slice(current.startIndex + current.headerLength, nextStart);
      const blockToParse = (i === 0 ? preSectionText + '\n' : '') + sectionContent;

      const sectionStepTitle = current.label ? `مراحل اقدام در ${current.label}` : 'مراحل اقدام در سامانه';
      const { steps, transitionNote } = parseActionSteps(blockToParse, sectionStepTitle);

      const roleLabel = current.label ? `(${current.label})` : `(بخش ${i + 1})`;
      const fullTitle = `${rawSubject} ${roleLabel}`.trim();

      const descParts = [
        rawSubject,
        rawAudience ? `مخاطب: ${rawAudience} ${roleLabel}` : '',
      ].filter(Boolean);

      const draft: ParsedProcessDraft = {
        title: fullTitle,
        targetSystem: targetSystemClean,
        targetUrl,
        audience: rawAudience ? `${rawAudience} ${roleLabel}` : current.label,
        description: descParts.join('\n'),
        category: 'education',
        scope: 'portal',
        departmentName: 'وزارت آموزش و پرورش',
        isPublished: false,
        steps,
      };

      if (transitionNote) {
        draft.nextProcessNote = transitionNote;
      }

      drafts.push(draft);
    }

    // Connect sibling workflow chain
    for (let i = 0; i < drafts.length - 1; i++) {
      drafts[i].nextProcessDraftIndex = i + 1;
      if (!drafts[i].nextProcessNote) {
        drafts[i].nextProcessNote = `ادامه کار در فرایند وابسته: ${drafts[i + 1].title}`;
      }
    }

    return {
      isMultiStage: true,
      metadata,
      processes: drafts,
    };
  }

  // CASE B: Single Stage Process
  let singleContent = normalized;
  if (foundSections.length === 1) {
    singleContent = normalized.slice(foundSections[0].startIndex + foundSections[0].headerLength);
  }
  const { steps } = parseActionSteps(singleContent);

  const descParts = [
    rawSubject,
    rawAudience ? `مخاطب: ${rawAudience}` : '',
  ].filter(Boolean);

  const singleDraft: ParsedProcessDraft = {
    title: rawSubject,
    targetSystem: targetSystemClean,
    targetUrl,
    audience: rawAudience || undefined,
    description: descParts.join('\n'),
    category: 'education',
    scope: 'portal',
    departmentName: 'وزارت آموزش و پرورش',
    isPublished: false,
    steps,
  };

  return {
    isMultiStage: false,
    metadata,
    processes: [singleDraft],
  };
}
