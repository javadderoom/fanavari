import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBotRequest } from '../src/lib/bot-detector';

describe('Process View Bot Filtering System', () => {
  it('should detect and filter search engine crawlers from view count', () => {
    const crawlerHeaders = new Headers({
      'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'accept-language': 'en',
    });

    const check = isBotRequest(crawlerHeaders);
    assert.equal(check.isBot, true);
    assert.equal(check.category, 'search_engine');
  });

  it('should detect automated scrapers and CLI tools (curl, python, axios)', () => {
    const curlHeaders = new Headers({
      'user-agent': 'curl/7.68.0',
    });
    assert.equal(isBotRequest(curlHeaders).isBot, true);
    assert.equal(isBotRequest(curlHeaders).category, 'cli_scraper');

    const pythonHeaders = new Headers({
      'user-agent': 'python-requests/2.28.1',
    });
    assert.equal(isBotRequest(pythonHeaders).isBot, true);
    assert.equal(isBotRequest(pythonHeaders).category, 'cli_scraper');
  });

  it('should detect headless browser environments via navigator.webdriver', () => {
    const browserHeaders = new Headers({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'accept-language': 'fa-IR,fa;q=0.9',
    });

    // Simulating Puppeteer/Selenium setting isWebDriver
    const check = isBotRequest(browserHeaders, { isWebDriver: true });
    assert.equal(check.isBot, true);
    assert.equal(check.category, 'client_signal');
  });

  it('should accept valid human visitor requests', () => {
    const humanHeaders = new Headers({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'accept-language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
      'sec-ch-ua-mobile': '?0',
    });

    const check = isBotRequest(humanHeaders, { isWebDriver: false, dwellTimeMs: 2500 });
    assert.equal(check.isBot, false);
    assert.equal(check.reason, undefined);
  });
});
