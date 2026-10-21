import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { isBotRequest } from '../src/lib/bot-detector';

describe('Bot Detector Utility', () => {
  it('should flag empty or missing user agents as bots', () => {
    const headers = new Headers();
    const result = isBotRequest(headers);
    assert.equal(result.isBot, true);
    assert.equal(result.category, 'generic_bot');
  });

  it('should flag search engine crawlers', () => {
    const googlebot = new Headers({
      'user-agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'accept-language': 'en-US,en;q=0.9',
    });
    assert.equal(isBotRequest(googlebot).isBot, true);
    assert.equal(isBotRequest(googlebot).category, 'search_engine');

    const bingbot = new Headers({
      'user-agent': 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'accept-language': 'en-US,en;q=0.9',
    });
    assert.equal(isBotRequest(bingbot).isBot, true);
    assert.equal(isBotRequest(bingbot).category, 'search_engine');

    const yandex = new Headers({
      'user-agent': 'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)',
      'accept-language': 'ru,en;q=0.9',
    });
    assert.equal(isBotRequest(yandex).isBot, true);
    assert.equal(isBotRequest(yandex).category, 'search_engine');
  });

  it('should flag AI & LLM crawlers', () => {
    const gptBot = new Headers({
      'user-agent': 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)',
      'accept-language': 'en-US',
    });
    assert.equal(isBotRequest(gptBot).isBot, true);
    assert.equal(isBotRequest(gptBot).category, 'ai_crawler');

    const claudeBot = new Headers({
      'user-agent': 'ClaudeBot/1.0; (+claudebot@anthropic.com)',
      'accept-language': 'en-US',
    });
    assert.equal(isBotRequest(claudeBot).isBot, true);
    assert.equal(isBotRequest(claudeBot).category, 'ai_crawler');
  });

  it('should flag social media preview bots', () => {
    const telegram = new Headers({
      'user-agent': 'TelegramBot (like TwitterBot)',
    });
    assert.equal(isBotRequest(telegram).isBot, true);
    assert.equal(isBotRequest(telegram).category, 'social_bot');

    const facebook = new Headers({
      'user-agent': 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
    });
    assert.equal(isBotRequest(facebook).isBot, true);
    assert.equal(isBotRequest(facebook).category, 'social_bot');
  });

  it('should flag headless browsers and automation tools', () => {
    const puppeteer = new Headers({
      'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.6099.109 Safari/537.36',
      'accept-language': 'en-US',
    });
    assert.equal(isBotRequest(puppeteer).isBot, true);
    assert.equal(isBotRequest(puppeteer).category, 'headless_tool');
  });

  it('should flag CLI tools and HTTP libraries', () => {
    const curl = new Headers({ 'user-agent': 'curl/7.88.1' });
    assert.equal(isBotRequest(curl).isBot, true);
    assert.equal(isBotRequest(curl).category, 'cli_scraper');

    const python = new Headers({ 'user-agent': 'python-requests/2.31.0' });
    assert.equal(isBotRequest(python).isBot, true);
    assert.equal(isBotRequest(python).category, 'cli_scraper');

    const axios = new Headers({ 'user-agent': 'axios/1.6.2' });
    assert.equal(isBotRequest(axios).isBot, true);
    assert.equal(isBotRequest(axios).category, 'cli_scraper');
  });

  it('should flag client signals such as navigator.webdriver', () => {
    const humanHeaders = new Headers({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'accept-language': 'fa-IR,fa;q=0.9,en-US;q=0.8,en;q=0.7',
    });

    const flagged = isBotRequest(humanHeaders, { isWebDriver: true });
    assert.equal(flagged.isBot, true);
    assert.equal(flagged.category, 'client_signal');
  });

  it('should allow legitimate human browsers with proper language headers', () => {
    // Windows Chrome
    const winChrome = new Headers({
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      'accept-language': 'fa-IR,fa;q=0.9,en;q=0.8',
    });
    assert.equal(isBotRequest(winChrome).isBot, false);

    // iPhone Safari
    const iosSafari = new Headers({
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Mobile/15E148 Safari/604.1',
      'accept-language': 'fa-IR,en-US;q=0.9',
    });
    assert.equal(isBotRequest(iosSafari).isBot, false);

    // Android Chrome
    const androidChrome = new Headers({
      'user-agent': 'Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36',
      'accept-language': 'fa-IR,en-US;q=0.9',
    });
    assert.equal(isBotRequest(androidChrome).isBot, false);

    // Mac Firefox
    const macFirefox = new Headers({
      'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 14.3; rv:123.0) Gecko/20100101 Firefox/123.0',
      'accept-language': 'en-US,en;q=0.5',
    });
    assert.equal(isBotRequest(macFirefox).isBot, false);
  });
});
