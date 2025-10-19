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
}

export const ScrapeSchema = SchemaFactory.createForClass(Scrape);
