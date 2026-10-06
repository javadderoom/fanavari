import { Process, SearchResult, SearchMatchDetail, InformationPost } from '@/types/process';

/**
 * Normalizes Persian and English search queries:
 * - Unifies Persian/Arabic Yeh & Kaf
 * - Converts Persian/Arabic digits to Latin digits
 * - Normalizes zero-width non-joiners
 * - Lowers case
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[\u064A\u0649]/g, 'ی') // Arabic Yeh -> Persian Yeh
    .replace(/\u0643/g, 'ک')         // Arabic Kaf -> Persian Kaf
    .replace(/\u200c/g, ' ')        // ZWNJ to space for token matching
    .replace(/[\u06F0-\u06F9]/g, (d) => String(d.charCodeAt(0) - 0x06F0)) // Persian numbers -> Latin
    .replace(/[\u0660-\u0669]/g, (d) => String(d.charCodeAt(0) - 0x0660)) // Arabic numbers -> Latin
    .replace(/[\s\-_/\\,.:;!؟?،؛]+/g, ' ')
    .trim();
}

/**
 * Tokenizes normalized search string
 */
export function tokenize(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];
  return normalized.split(' ').filter(token => token.length > 0);
}

/**
 * Extracts a concise surrounding snippet for the matched term
 */
function createSnippet(rawText: string, queryToken: string, maxLength = 85): string {
  const normRaw = normalizeText(rawText);
  const normToken = normalizeText(queryToken);
  const index = normRaw.indexOf(normToken);

  if (index === -1) {
    return rawText.slice(0, maxLength) + (rawText.length > maxLength ? '...' : '');
  }

  const start = Math.max(0, index - 25);
  const end = Math.min(rawText.length, index + queryToken.length + 50);
  let snippet = rawText.slice(start, end).trim();

  if (start > 0) snippet = '...' + snippet;
  if (end < rawText.length) snippet = snippet + '...';

  return snippet;
}

/**
 * Google-grade omni-search engine with deep scanning and relevance ranking
 */
export function searchProcesses(processes: Process[], rawQuery: string): SearchResult[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    // Return all processes with base score
    return processes.map(process => ({
      process,
      score: 1,
      bestMatch: {
        type: 'overview',
        locationLabel: 'عنوان فرایند',
        snippet: process.description,
        matchedText: process.title,
      },
      allMatchesCount: 0,
    }));
  }

  const tokens = tokenize(trimmed);
  const normQuery = normalizeText(trimmed);

  const results: SearchResult[] = [];

  for (const process of processes) {
    let score = 0;
    let matchCount = 0;
    const matchCandidates: { score: number; detail: SearchMatchDetail }[] = [];

    const normTitle = normalizeText(process.title);
    const normDesc = normalizeText(process.description);
    const normSystem = normalizeText(process.targetSystem + ' ' + (process.targetUrl || ''));
    const normDept = normalizeText(process.departmentName);
    const normTags = process.tags.map(t => normalizeText(t)).join(' ');

    // 1. Process Title Match (Highest Weight)
    if (normTitle.includes(normQuery)) {
      score += 180;
      matchCount++;
      matchCandidates.push({
        score: 180,
        detail: {
          type: 'title',
          locationLabel: 'عنوان اصلی فرایند',
          snippet: process.title,
          matchedText: trimmed,
        }
      });
    } else {
      tokens.forEach(tok => {
        if (normTitle.includes(tok)) {
          score += 50;
          matchCount++;
          matchCandidates.push({
            score: 50,
            detail: {
              type: 'title',
              locationLabel: 'عنوان اصلی فرایند',
              snippet: process.title,
              matchedText: tok,
            }
          });
        }
      });
    }

    // 2. Department & Category
    tokens.forEach(tok => {
      if (normDept.includes(tok)) {
        score += 25;
        matchCount++;
        matchCandidates.push({
          score: 25,
          detail: {
            type: 'system',
            locationLabel: `دپارتمان: ${process.departmentName}`,
            snippet: process.departmentName,
            matchedText: tok,
          }
        });
      }
    });

    // 3. Target System & Portal URLs
    if (normSystem.includes(normQuery)) {
      score += 80;
      matchCount++;
      matchCandidates.push({
        score: 80,
        detail: {
          type: 'system',
          locationLabel: `سامانه مرتبط: ${process.targetSystem}`,
          snippet: `${process.targetSystem} (${process.targetUrl || ''})`,
          matchedText: trimmed,
        }
      });
    } else {
      tokens.forEach(tok => {
        if (normSystem.includes(tok)) {
          score += 35;
          matchCount++;
          matchCandidates.push({
            score: 35,
            detail: {
              type: 'system',
              locationLabel: `سامانه هدف: ${process.targetSystem}`,
              snippet: process.targetSystem,
              matchedText: tok,
            }
          });
        }
      });
    }

    // 4. Tags & Keywords
    tokens.forEach(tok => {
      if (normTags.includes(tok)) {
        score += 40;
        matchCount++;
        const matchedTag = process.tags.find(t => normalizeText(t).includes(tok)) || tok;
        matchCandidates.push({
          score: 40,
          detail: {
            type: 'tag',
            locationLabel: `برچسب کلیدی: ${matchedTag}`,
            snippet: process.tags.join(' • '),
            matchedText: tok,
          }
        });
      }
    });

    // 5. Deep Step-by-Step Inspection
    process.steps.forEach((step, stepIndex) => {
      const normStepTitle = normalizeText(step.title);
      const normStepContent = normalizeText(step.contentMarkdown);
      const normMenu = normalizeText(step.targetMenuPath || '');

      // Step Title & Menu Path
      if (normStepTitle.includes(normQuery) || (normMenu && normMenu.includes(normQuery))) {
        score += 100;
        matchCount++;
        matchCandidates.push({
          score: 100,
          detail: {
            type: 'step',
            locationLabel: `گام ${step.orderIndex}: ${step.title}`,
            snippet: step.targetMenuPath || step.title,
            matchedText: trimmed,
            stepIndex,
          }
        });
      } else {
        tokens.forEach(tok => {
          if (normStepTitle.includes(tok) || normMenu.includes(tok)) {
            score += 45;
            matchCount++;
            matchCandidates.push({
              score: 45,
              detail: {
                type: 'step',
                locationLabel: `گام ${step.orderIndex}: ${step.title}`,
                snippet: step.targetMenuPath ? `${step.targetMenuPath} • ${step.title}` : step.title,
                matchedText: tok,
                stepIndex,
              }
            });
          }
        });
      }

      // Step Instruction Body Text
      tokens.forEach(tok => {
        if (normStepContent.includes(tok)) {
          score += 20;
          matchCount++;
          matchCandidates.push({
            score: 20,
            detail: {
              type: 'step',
              locationLabel: `توضیحات گام ${step.orderIndex}`,
              snippet: createSnippet(step.contentMarkdown, tok),
              matchedText: tok,
              stepIndex,
            }
          });
        }
      });

      // Step Tips & Pro-Tips
      if (step.tips && step.tips.length > 0) {
        step.tips.forEach(tip => {
          const normTip = normalizeText(tip);
          tokens.forEach(tok => {
            if (normTip.includes(tok)) {
              score += 35;
              matchCount++;
              matchCandidates.push({
                score: 35,
                detail: {
                  type: 'tip',
                  locationLabel: `نکته در گام ${step.orderIndex}: ${step.title}`,
                  snippet: createSnippet(tip, tok),
                  matchedText: tok,
                  stepIndex,
                }
              });
            }
          });
        });
      }

      // Copyable Fields (e.g. "شماره شبا", "کد ملی", "کلید SSH")
      if (step.copyableFields) {
        step.copyableFields.forEach(field => {
          const normFieldLabel = normalizeText(field.label);
          const normFieldValue = normalizeText(field.value);

          tokens.forEach(tok => {
            if (normFieldLabel.includes(tok) || normFieldValue.includes(tok)) {
              score += 75;
              matchCount++;
              matchCandidates.push({
                score: 75,
                detail: {
                  type: 'field',
                  locationLabel: `فیلد مورد نیاز در گام ${step.orderIndex}: ${field.label}`,
                  snippet: `${field.label}: «${field.value}»`,
                  matchedText: tok,
                  stepIndex,
                }
              });
            }
          });
        });
      }

      // Error Guides & Troubleshooting (Crucial Requirement!)
      if (step.errorGuides) {
        step.errorGuides.forEach(err => {
          const normErrCode = normalizeText(err.errorCode);
          const normErrTitle = normalizeText(err.errorTitle);
          const normErrCause = normalizeText(err.cause);
          const normErrSol = normalizeText(err.solution);

          // Exact error code match (e.g. ERR-403, 403, TAX-INVALID-ID)
          if (normErrCode.includes(normQuery) || (normQuery.length >= 3 && normErrCode.includes(normQuery))) {
            score += 140;
            matchCount++;
            matchCandidates.push({
              score: 140,
              detail: {
                type: 'error',
                locationLabel: `راهنمای رفع خطا [${err.errorCode}] در گام ${step.orderIndex}`,
                snippet: `${err.errorTitle} — راه‌حل: ${err.solution}`,
                matchedText: trimmed,
                stepIndex,
              }
            });
          }

          tokens.forEach(tok => {
            if (normErrTitle.includes(tok) || normErrCause.includes(tok) || normErrSol.includes(tok)) {
              score += 70;
              matchCount++;
              matchCandidates.push({
                score: 70,
                detail: {
                  type: 'error',
                  locationLabel: `خطای احتمالی در گام ${step.orderIndex}: ${err.errorTitle}`,
                  snippet: `${err.errorTitle} • راهکار: ${createSnippet(err.solution, tok)}`,
                  matchedText: tok,
                  stepIndex,
                }
              });
            }
          });
        });
      }
    });

    // 6. Process Description
    tokens.forEach(tok => {
      if (normDesc.includes(tok)) {
        score += 18;
        matchCount++;
        matchCandidates.push({
          score: 18,
          detail: {
            type: 'description',
            locationLabel: 'شرح فرایند',
            snippet: createSnippet(process.description, tok),
            matchedText: tok,
          }
        });
      }
    });

    // If matches were found, sort candidate matches to pick the absolute best one
    if (score > 0 && matchCandidates.length > 0) {
      matchCandidates.sort((a, b) => b.score - a.score);
      results.push({
        itemType: 'process',
        process,
        score,
        bestMatch: matchCandidates[0].detail,
        allMatchesCount: matchCount,
      });
    }
  }

  // Sort by final score descending (highest relevance first)
  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Strips HTML tags and excessive whitespace for clean text analysis
 */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Searches information posts (circulars, announcements, guides)
 */
export function searchAnnouncements(announcements: InformationPost[], rawQuery: string): SearchResult[] {
  const trimmed = rawQuery.trim();
  if (!trimmed) {
    return announcements.map(post => ({
      itemType: 'information',
      post,
      score: post.isPinned ? 10 : 1,
      bestMatch: {
        type: post.type === 'circular' ? 'circular' : 'announcement',
        locationLabel: post.type === 'circular' ? 'بخشنامه اداری' : 'اطلاعیه رسمی',
        snippet: post.summary || stripHtml(post.content).slice(0, 100),
        matchedText: post.title,
      },
      allMatchesCount: 0,
    }));
  }

  const tokens = tokenize(trimmed);
  const normQuery = normalizeText(trimmed);
  const results: SearchResult[] = [];

  for (const post of announcements) {
    let score = 0;
    let matchCount = 0;
    const matchCandidates: { score: number; detail: SearchMatchDetail }[] = [];

    const normTitle = normalizeText(post.title);
    const normSummary = normalizeText(post.summary || '');
    const cleanContent = stripHtml(post.content);
    const normContent = normalizeText(cleanContent);
    const normDept = normalizeText(post.departmentName || '');
    const normSystem = normalizeText(post.systemToolName || '');

    // Priority and Pinned boost
    let baseBoost = 0;
    if (post.priority === 'urgent') baseBoost += 25;
    if (post.isPinned) baseBoost += 20;

    // 1. Title Match (High Priority)
    if (normTitle.includes(normQuery)) {
      const matchScore = 170 + baseBoost;
      score += matchScore;
      matchCount++;
      matchCandidates.push({
        score: matchScore,
        detail: {
          type: post.type === 'circular' ? 'circular' : 'announcement',
          locationLabel: post.type === 'circular' 
            ? `بخشنامه اداری: ${post.title}` 
            : post.type === 'guide' 
            ? `راهنمای سامانه: ${post.title}` 
            : `اطلاعیه رسمی: ${post.title}`,
          snippet: post.title,
          matchedText: trimmed,
        }
      });
    } else {
      tokens.forEach(tok => {
        if (normTitle.includes(tok)) {
          const matchScore = 55 + baseBoost;
          score += matchScore;
          matchCount++;
          matchCandidates.push({
            score: matchScore,
            detail: {
              type: post.type === 'circular' ? 'circular' : 'announcement',
              locationLabel: post.type === 'circular' 
                ? `بخشنامه: ${post.title}` 
                : `اطلاعیه: ${post.title}`,
              snippet: post.title,
              matchedText: tok,
            }
          });
        }
      });
    }

    // 2. Summary Match
    if (normSummary) {
      if (normSummary.includes(normQuery)) {
        score += 85;
        matchCount++;
        matchCandidates.push({
          score: 85,
          detail: {
            type: 'description',
            locationLabel: 'خلاصه اجرایی اطلاعیه',
            snippet: post.summary!,
            matchedText: trimmed,
          }
        });
      } else {
        tokens.forEach(tok => {
          if (normSummary.includes(tok)) {
            score += 35;
            matchCount++;
            matchCandidates.push({
              score: 35,
              detail: {
                type: 'description',
                locationLabel: 'خلاصه اطلاعیه',
                snippet: createSnippet(post.summary!, tok),
                matchedText: tok,
              }
            });
          }
        });
      }
    }

    // 3. Body Content Match
    tokens.forEach(tok => {
      if (normContent.includes(tok)) {
        score += 30;
        matchCount++;
        matchCandidates.push({
          score: 30,
          detail: {
            type: 'description',
            locationLabel: 'متن اطلاعیه / بخشنامه',
            snippet: createSnippet(cleanContent, tok),
            matchedText: tok,
          }
        });
      }
    });

    // 4. Department / System
    tokens.forEach(tok => {
      if ((normDept && normDept.includes(tok)) || (normSystem && normSystem.includes(tok))) {
        score += 25;
        matchCount++;
        matchCandidates.push({
          score: 25,
          detail: {
            type: 'system',
            locationLabel: normSystem ? `سامانه مرتبط: ${post.systemToolName}` : `دپارتمان: ${post.departmentName}`,
            snippet: `${post.systemToolName || ''} ${post.departmentName || ''}`.trim(),
            matchedText: tok,
          }
        });
      }
    });

    if (score > 0 && matchCandidates.length > 0) {
      matchCandidates.sort((a, b) => b.score - a.score);
      results.push({
        itemType: 'information',
        post,
        score,
        bestMatch: matchCandidates[0].detail,
        allMatchesCount: matchCount,
      });
    }
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/**
 * Omni-Search engine: searches across both processes and information circulars/posts
 */
export function searchOmni(
  processes: Process[],
  announcements: InformationPost[] = [],
  rawQuery: string
): SearchResult[] {
  const processResults = searchProcesses(processes, rawQuery).map(r => ({
    ...r,
    itemType: 'process' as const,
  }));

  const announcementResults = announcements && announcements.length > 0
    ? searchAnnouncements(announcements, rawQuery)
    : [];

  const combined = [...processResults, ...announcementResults];
  combined.sort((a, b) => b.score - a.score);
  return combined;
}

/**
 * Helper to highlight matching tokens in a string
 */
export function highlightMatchText(text: string, query: string): { before: string; match: string; after: string } | null {
  if (!text || !query) return null;
  const normText = normalizeText(text);
  const normQuery = normalizeText(query);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return null;

  return {
    before: text.slice(0, idx),
    match: text.slice(idx, idx + query.length),
    after: text.slice(idx + query.length)
  };
}
