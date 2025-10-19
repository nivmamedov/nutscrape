import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ScrapeDocument = HydratedDocument<Scrape>;

@Schema({ collection: 'scrapes' })
export class Scrape {
  @Prop()
  _id: string;

  @Prop()
  url: string;

  @Prop({ type: String, default: 'Initialized' })
  status: string;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;

  @Prop()
  html?: string;

  @Prop({
    type: String,
    default:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  })
  userAgent: string;

  @Prop({ type: Boolean, default: true })
  followRedirects: boolean;

  @Prop({ type: Number, default: 5 })
  maxRedirects: number;

  @Prop({ type: Boolean, default: false })
  enableJavaScript: boolean;

  @Prop()
  waitUntil?: string;

  @Prop()
  waitForSelector?: string;

  @Prop()
  waitForTimeout?: number;

  @Prop()
  blockImages?: boolean;

  @Prop()
  blockCSS?: boolean;

  @Prop()
  blockFonts?: boolean;

  @Prop({ type: Number, default: 3 })
  retries: number;

  @Prop()
  error?: string;

  @Prop({ type: Number, default: 5 })
  maxRetries?: number;

  @Prop({ type: Number, default: 1000 })
  retryBaseDelay?: number;

  @Prop({ type: Number, default: 60000 })
  retryMaxDelay?: number;

  @Prop({ type: Number, default: 2 })
  retryBackoffMultiplier?: number;

  @Prop({ type: Boolean, default: true })
  retryJitter?: boolean;

  @Prop({ type: [Object], default: [] })
  customRetryKeywords?: Array<{
    keyword: string;
    caseSensitive: boolean;
    retryDelay: number;
    backoffMultiplier: number;
  }>;

  @Prop({ type: Number, default: 0 })
  retryAttempts?: number;

  @Prop({ type: [String], default: [] })
  retryReasons?: string[];
}

export const ScrapeSchema = SchemaFactory.createForClass(Scrape);
