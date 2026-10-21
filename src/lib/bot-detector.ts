/**
 * Bot Detector & Crawler Filter Utility
 * Detects search engine crawlers, automated scrapers, headless browsers,
 * AI bots, and CLI tools to protect analytics and view counts from inflation.
 */

export interface BotClientPayload {
  isWebDriver?: boolean;
  dwellTimeMs?: number;
  screenResolution?: string;
  hasInteracted?: boolean;
}

export interface BotDetectionResult {
  isBot: boolean;
  reason?: string;
  category?: 'search_engine' | 'ai_crawler' | 'social_bot' | 'headless_tool' | 'cli_scraper' | 'security_scanner' | 'generic_bot' | 'client_signal';
}

// 1. Major Search Engine Crawlers
const SEARCH_ENGINE_REGEX = /(googlebot|bingbot|yandex(bot|images|video)?|baiduspider|duckduckbot|slurp|sogou|exabot|msnbot|teoma|qwantify|seznam|naverbot|yeti)/i;

// 2. AI Crawlers & LLM Scrapers
const AI_CRAWLER_REGEX = /(gptbot|chatgpt-user|claudebot|claude-web|anthropic-ai|applebot|bytespider|cohere-ai|ccbot|diffbot|perplexitybot|omgili|youbot|meta-externalagent|facebookbot)/i;

// 3. Social Media Link Preview Bots
const SOCIAL_BOT_REGEX = /(facebookexternalhit|twitterbot|telegrambot|whatsapp|slackbot|discordbot|linkedinbot|pinterest|skypeuripreview|vkshare|viber)/i;

// 4. Headless Browsers & Automation Frameworks
const HEADLESS_REGEX = /(headlesschrome|phantomjs|puppeteer|playwright|selenium|webdriver|cypress|nightwatch|chromedriver|geckodriver)/i;

// 5. Scrapers, CLI Tools & HTTP Libraries
const CLI_SCRAPER_REGEX = /(curl\/|wget\/|python-requests|aiohttp|httpx|httpclient|apache-httpclient|go-http-client|postmanruntime|insomnia|scrapy|undici|node-fetch|axios\/|got\/|libwww-perl|winhttp|mechanize|urllib|http_request|rest-client|okhttp|faraday)/i;

// 6. Security Scanners & Uptime Checkers
const SCANNER_REGEX = /(uptimerobot|pingdom|statuscake|site24x7|datadog|sentry|newrelic|nessus|qualys|nikto|sqlmap|nmap|masscan|zgrab|acunetix)/i;

// 7. Generic bot, spider, scraper keywords (boundary checked)
const GENERIC_BOT_REGEX = /\b(bot|crawler|spider|scraper|transcoder|feedfetcher|archiver)\b/i;

/**
 * Checks whether an incoming HTTP request is from a bot, crawler, or automated script.
 */
export function isBotRequest(
  req: Request | Headers,
  clientPayload?: BotClientPayload
): BotDetectionResult {
  const headers = req instanceof Headers ? req : req.headers;
  const userAgent = (headers.get('user-agent') || '').trim();

  // Rule 1: Missing or suspiciously short User-Agent
  if (!userAgent || userAgent.length < 5) {
    return {
      isBot: true,
      reason: 'Empty or suspiciously short User-Agent',
      category: 'generic_bot',
    };
  }

  // Rule 2: Client-side headless webdriver detection
  if (clientPayload?.isWebDriver === true) {
    return {
      isBot: true,
      reason: 'Client reported navigator.webdriver === true',
      category: 'client_signal',
    };
  }

  // Rule 3: Search Engine Crawlers
  if (SEARCH_ENGINE_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched Search Engine Crawler pattern',
      category: 'search_engine',
    };
  }

  // Rule 4: AI & LLM Scrapers
  if (AI_CRAWLER_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched AI / LLM Crawler pattern',
      category: 'ai_crawler',
    };
  }

  // Rule 5: Social Media Link Preview Bots
  if (SOCIAL_BOT_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched Social Media Link Preview Bot',
      category: 'social_bot',
    };
  }

  // Rule 6: Headless Browsers
  if (HEADLESS_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched Headless Browser / Automation pattern',
      category: 'headless_tool',
    };
  }

  // Rule 7: Scrapers, CLI Tools & HTTP Client Libraries
  if (CLI_SCRAPER_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched CLI Tool / HTTP Client Library',
      category: 'cli_scraper',
    };
  }

  // Rule 8: Security & Uptime Scanners
  if (SCANNER_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched Monitoring / Security Scanner',
      category: 'security_scanner',
    };
  }

  // Rule 9: Generic Bot keywords
  if (GENERIC_BOT_REGEX.test(userAgent)) {
    return {
      isBot: true,
      reason: 'Matched Generic Bot keyword in User-Agent',
      category: 'generic_bot',
    };
  }

  // Rule 10: Missing standard browser headers (Heuristics)
  // Legitimate modern human browsers send Accept-Language when navigating or fetching API
  const acceptLanguage = headers.get('accept-language');
  const isLikelyBrowserUA = /mozilla\/5\.0/i.test(userAgent) && /(chrome|safari|firefox|edge|opera)/i.test(userAgent);
  if (isLikelyBrowserUA && !acceptLanguage) {
    // If it claims to be Chrome/Firefox/Safari but sends zero language preference, it is commonly an automated script spoofing the UA
    return {
      isBot: true,
      reason: 'Browser User-Agent spoofing detected: missing Accept-Language header',
      category: 'generic_bot',
    };
  }

  return { isBot: false };
}
