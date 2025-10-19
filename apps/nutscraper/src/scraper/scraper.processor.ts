import { Scrape, ScrapeDocument } from '@app/nutscrapedb';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job } from 'bullmq';
import { Model } from 'mongoose';
import { ScraperService } from './scraper.service';

@Processor('scrapes', {
  concurrency: process.env.CONCURRENCY ? parseInt(process.env.CONCURRENCY) : 10,
})
export class ScraperProcessor extends WorkerHost {
  constructor(
    @InjectModel(Scrape.name, 'nutscraper')
    private scrapeModel: Model<ScrapeDocument>,
    private readonly scraperService: ScraperService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    console.log(`Processing scrape ${job.data.scrapeId}`);
    switch (job.name) {
      case 'scrape':
        console.debug(`Handling scrape ${job.data.scrapeId}`);

        const scrape = await this.scrapeModel.findById(job.data.scrapeId);
        if (!scrape) {
          console.error(`Scrape ${job.data.scrapeId} not found`);
          return;
        }
        const result = await this.scraperService.scrape(
          scrape.url,
          scrape.userAgent,
          scrape.followRedirects,
          scrape.maxRedirects,
          scrape.enableJavaScript,
          scrape.waitUntil || 'load',
          scrape.waitForSelector,
          scrape.waitForTimeout || 30000,
          scrape.blockImages ?? false,
          scrape.blockCSS ?? false,
          scrape.blockFonts ?? false,
          scrape.retries,
          job.data.proxy, // Pass proxy from MQ
        );

        if (result.success) {
          scrape.html = result.data;
          scrape.status = 'Completed';
          console.debug(`Scrape ${job.data.scrapeId} completed successfully`);
        } else {
          scrape.status = 'Failed';
          scrape.error = result.error;
          console.error(`Scrape ${job.data.scrapeId} failed: ${result.error}`);
        }

        await scrape.save();
        return;
    }
  }
}
