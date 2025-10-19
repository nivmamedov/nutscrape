import {
  getDefaultBrowserUserAgent,
  isApiClientUserAgent,
  ProxyCredentials,
} from '@app/nutscrapedb';
import { HttpStatus, Injectable, OnModuleDestroy } from '@nestjs/common';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import puppeteer, { Browser, Page } from 'puppeteer';
import { SocksProxyAgent } from 'socks-proxy-agent';

@Injectable()
export class ScraperService implements OnModuleDestroy {
  private browser: Browser | null = null;

  async scrape(
    url: string,
    userAgent: string,
    followRedirects: boolean = true,
    maxRedirects: number = 5,
    enableJavaScript: boolean = false,
    waitUntil: string = 'load',
    waitForSelector?: string,
    waitForTimeout: number = 30000,
    blockImages: boolean = false,
    blockCSS: boolean = false,
    blockFonts: boolean = false,
    retries: number = 3,
    proxy?: ProxyCredentials,
  ) {
    if (enableJavaScript && isApiClientUserAgent(userAgent)) {
      console.warn(
        `User agent '${userAgent}' is not compatible with JavaScript execution. Using Chrome user agent instead.`,
      );
      userAgent = getDefaultBrowserUserAgent();
    }

    console.debug(
      `Starting scrape for ${url} - Mode: ${enableJavaScript ? 'Dynamic (Puppeteer)' : 'Static (Fetch)'}, UserAgent: ${userAgent}, FollowRedirects: ${followRedirects}, MaxRedirects: ${maxRedirects}`,
    );

    if (enableJavaScript) {
      return this.dynamicScrape(
        url,
        userAgent,
        waitUntil,
        waitForSelector,
        waitForTimeout,
        blockImages,
        blockCSS,
        blockFonts,
        followRedirects,
        maxRedirects,
        retries,
        proxy,
      );
    } else {
      return this.staticScrape(
        url,
        userAgent,
        followRedirects,
        maxRedirects,
        retries,
        proxy,
      );
    }
  }

  private createAxiosClient(
    userAgent: string,
    followRedirects: boolean,
    maxRedirects: number,
    retries: number,
    proxy?: ProxyCredentials,
  ) {
    const clientConfig: any = {
      headers: {
        'User-Agent': userAgent,
      },
      maxRedirects: followRedirects ? maxRedirects : 0,
      timeout: 30000,
    };

    // Add proxy configuration if provided
    if (proxy) {
      if (proxy.type === 'socks5') {
        // Use SOCKS5 proxy agent for SOCKS5 proxies
        const proxyUrl = this.buildProxyUrl(proxy);
        clientConfig.httpsAgent = new SocksProxyAgent(proxyUrl);
        clientConfig.httpAgent = new SocksProxyAgent(proxyUrl);
      } else {
        // Use standard proxy configuration for HTTP/HTTPS proxies
        clientConfig.proxy = {
          protocol: proxy.type,
          host: proxy.address,
          port: proxy.port,
          auth:
            proxy.username && proxy.password
              ? {
                  username: proxy.username,
                  password: proxy.password,
                }
              : undefined,
        };
      }
    }

    const client = axios.create(clientConfig);

    axiosRetry(client, {
      retries,
      retryDelay: (retryCount) => {
        const baseDelay = 1000;
        const maxDelay = 10000;
        const delay = Math.min(
          baseDelay * Math.pow(2, retryCount - 1),
          maxDelay,
        );
        const jitter = Math.random() * 1000;
        return delay + jitter;
      },
      retryCondition: (error) => {
        if (error.response) {
          const status = error.response.status;
          if (
            status >= HttpStatus.BAD_REQUEST &&
            status < HttpStatus.INTERNAL_SERVER_ERROR &&
            status !== HttpStatus.TOO_MANY_REQUESTS
          ) {
            return false;
          }

          return (
            status >= HttpStatus.INTERNAL_SERVER_ERROR ||
            status === HttpStatus.TOO_MANY_REQUESTS
          );
        }

        return true;
      },
    });

    return client;
  }

  private buildProxyUrl(proxy: ProxyCredentials): string {
    const auth =
      proxy.username && proxy.password
        ? `${proxy.username}:${proxy.password}@`
        : '';

    return `${proxy.type}://${auth}${proxy.address}:${proxy.port}`;
  }

  private async staticScrape(
    url: string,
    userAgent: string,
    followRedirects: boolean,
    maxRedirects: number = 5,
    retries: number = 3,
    proxy?: ProxyCredentials,
  ) {
    console.debug(
      `Starting static scraping for ${url} - FollowRedirects: ${followRedirects}, MaxRedirects: ${maxRedirects}, Retries: ${retries}`,
    );

    const client = this.createAxiosClient(
      userAgent,
      followRedirects,
      maxRedirects,
      retries,
      proxy,
    );

    try {
      const response = await client.get(url);
      console.debug(`Successfully scraped ${url} with static scraping`);
      return { success: true, data: response.data, error: null };
    } catch (error) {
      const errorMessage = this.formatAxiosError(error);
      console.error(
        `Static scraping failed after ${retries} attempts for ${url}: ${errorMessage}`,
      );
      return { success: false, data: null, error: errorMessage };
    }
  }

  private formatAxiosError(error: any): string {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;

        if (status >= HttpStatus.AMBIGUOUS && status < HttpStatus.BAD_REQUEST) {
          return `Redirect detected but not followed: ${status} ${statusText}`;
        }

        return `HTTP ${status}: ${statusText}`;
      }

      if (error.request) {
        return `Network error: ${error.message}`;
      }
    }

    return error.message || 'Unknown error occurred';
  }

  private async dynamicScrape(
    url: string,
    userAgent: string,
    waitUntil: string,
    waitForSelector?: string,
    waitForTimeout: number = 30000,
    blockImages: boolean = false,
    blockCSS: boolean = false,
    blockFonts: boolean = false,
    followRedirects: boolean = true,
    maxRedirects: number = 5,
    retries: number = 3,
    proxy?: ProxyCredentials,
  ) {
    console.debug(`Starting dynamic scraping for ${url} - Retries: ${retries}`);

    let lastError: any = null;

    for (let attempt = 1; attempt <= retries; attempt++) {
      let page: Page | null = null;

      try {
        if (!this.browser) {
          const launchArgs = [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu',
          ];

          // Add proxy configuration if provided
          if (proxy) {
            const proxyUrl = this.buildProxyUrl(proxy);
            launchArgs.push(`--proxy-server=${proxyUrl}`);
          }

          this.browser = await puppeteer.launch({
            headless: true,
            args: launchArgs,
          });
        }

        page = await this.browser.newPage();

        await page.setUserAgent({ userAgent });

        await page.setViewport({ width: 1920, height: 1080 });

        if (blockImages || blockCSS || blockFonts) {
          await page.setRequestInterception(true);
          page.on('request', (request) => {
            const resourceType = request.resourceType();

            if (blockImages && resourceType === 'image') {
              request.abort();
            } else if (blockCSS && resourceType === 'stylesheet') {
              request.abort();
            } else if (blockFonts && resourceType === 'font') {
              request.abort();
            } else {
              request.continue();
            }
          });
        }

        console.debug(
          `Navigating to ${url} with dynamic scraping (Puppeteer) - attempt ${attempt}`,
        );

        if (followRedirects) {
          let currentUrl = url;
          let redirectCount = 0;

          while (redirectCount < maxRedirects) {
            const response = await page.goto(currentUrl, {
              waitUntil: 'networkidle0' as any,
              timeout: waitForTimeout,
            });

            if (
              response &&
              response.status() >= HttpStatus.AMBIGUOUS &&
              response.status() < HttpStatus.BAD_REQUEST
            ) {
              const redirectUrl = response.headers()['location'];
              if (redirectUrl) {
                currentUrl = new URL(redirectUrl, currentUrl).toString();
                redirectCount++;

                if (redirectCount >= maxRedirects) {
                  throw new Error(
                    `Maximum redirect limit (${maxRedirects}) exceeded`,
                  );
                }

                console.debug(
                  `Following redirect ${redirectCount}/${maxRedirects} to: ${currentUrl}`,
                );
                continue;
              }
            }

            break;
          }

          if (redirectCount > 0) {
            console.debug(
              `Final URL after ${redirectCount} redirects: ${currentUrl}`,
            );
          }
        } else {
          await page.goto(url, {
            waitUntil: waitUntil as any,
            timeout: waitForTimeout,
          });
        }

        if (waitForSelector) {
          console.debug(`Waiting for selector: ${waitForSelector}`);
          await page.waitForSelector(waitForSelector, {
            timeout: waitForTimeout,
          });
        }

        const html = await page.content();

        console.debug(
          `Successfully scraped ${url} with dynamic scraping (attempt ${attempt})`,
        );
        return { success: true, data: html, error: null };
      } catch (error) {
        lastError = error;
        console.warn(
          `Dynamic scraping attempt ${attempt}/${retries} failed for ${url}:`,
          error.message,
        );

        if (error.message && error.message.includes('Maximum redirect limit')) {
          console.debug(`Not retrying due to redirect limit exceeded`);
          break;
        }

        if (attempt < retries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
          console.debug(`Waiting ${delay}ms before retry...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      } finally {
        if (page) {
          await page.close();
        }
      }
    }

    const errorMessage = lastError?.message || 'Unknown error occurred';
    console.error(
      `Dynamic scraping failed after ${retries} attempts for ${url}: ${errorMessage}`,
    );
    return { success: false, data: null, error: errorMessage };
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
