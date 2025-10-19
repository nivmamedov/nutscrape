import { Scrape, ScrapeDocument } from '@app/nutscrapedb';
import { InjectQueue, Processor, WorkerHost } from '@nestjs/bullmq';
import { InjectModel } from '@nestjs/mongoose';
import { Job, Queue } from 'bullmq';
import { Model } from 'mongoose';

@Processor('scrape_jobs')
export class ScrapeJobManagerProcessor extends WorkerHost {
  constructor(
    @InjectQueue('scrapes') private readonly scrapeQueue: Queue,
    @InjectModel(Scrape.name, 'nutscrapejob')
    private scrapeModel: Model<ScrapeDocument>,
  ) {
    super();
  }

  async process(job: Job<any, any, string>) {
    console.debug(`Queueing job ${job.id} for ${job.data.url}`);
    switch (job.name) {
      case 'initialize_scrape':
        // Base scrape data that's always saved
        const baseScrapeData = {
          _id: job.id!,
          url: job.data.url,
          userAgent: job.data.userAgent,
          followRedirects: job.data.followRedirects,
          maxRedirects: job.data.maxRedirects,
          enableJavaScript: job.data.enableJavaScript,
          retries: job.data.retries,
        };

        // Only add JavaScript-related parameters if JavaScript is enabled
        const scrapeData = job.data.enableJavaScript
          ? {
              ...baseScrapeData,
              waitUntil: job.data.waitUntil,
              waitForSelector: job.data.waitForSelector,
              waitForTimeout: job.data.waitForTimeout,
              blockImages: job.data.blockImages,
              blockCSS: job.data.blockCSS,
              blockFonts: job.data.blockFonts,
            }
          : baseScrapeData;

        const scrape = new this.scrapeModel(scrapeData);
        await scrape.save();
        await this.scrapeQueue.add('scrape', {
          scrapeId: scrape._id,
          proxy: job.data.proxy, // Pass proxy through MQ, not stored in DB
        });
        return;
    }
  }
}
