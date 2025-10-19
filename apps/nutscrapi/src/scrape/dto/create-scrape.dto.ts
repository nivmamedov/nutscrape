import type { ProxyCredentials } from '@app/nutscrapedb';
import { UserAgentType, WaitUntilType } from '@app/nutscrapedb';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  Validate,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { JavaScriptCompatibleUserAgentConstraint } from './validators/javascript-compatible-user-agent.validator';

export class CreateScrapeDto {
  @ApiProperty({
    description: 'The URL to scrape',
    example: 'https://google.com',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description:
      'User agent to use for the request. Required when enableJavaScript is true. Must be a browser user agent (CHROME, FIREFOX, SAFARI, EDGE) for JavaScript execution.',
    enum: Object.keys(UserAgentType),
    required: false,
    example: 'CHROME',
  })
  @IsOptional()
  @IsEnum(Object.keys(UserAgentType))
  @Validate(JavaScriptCompatibleUserAgentConstraint)
  userAgent?: string;

  @ApiProperty({
    description: 'Whether to follow redirects',
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  followRedirects?: boolean;

  @ApiProperty({
    description: 'Maximum number of redirects to follow',
    minimum: 1,
    maximum: 5,
    required: false,
    default: 5,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRedirects?: number;

  @ApiProperty({
    description: 'Enable JavaScript execution for dynamic content',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  enableJavaScript?: boolean;

  @ApiProperty({
    description:
      'Wait strategy for page load (only relevant when enableJavaScript is true). ' +
      'QUICK: Wait for DOMContentLoaded event (faster, good for static content). ' +
      'STANDARD: Wait for load event (default, waits for all resources). ' +
      'COMPLETE: Wait for networkidle0 (no network requests for 500ms, most complete). ' +
      'SMART: Wait for networkidle2 (no more than 2 network requests for 500ms, balanced).',
    enum: WaitUntilType,
    required: false,
    example: 'SMART',
  })
  @IsOptional()
  @IsEnum(WaitUntilType)
  @ValidateIf((o) => o.enableJavaScript === true)
  waitUntil?: WaitUntilType;

  @ApiProperty({
    description:
      'CSS selector to wait for before scraping (only relevant when enableJavaScript is true)',
    required: false,
    example: '.dynamic-content',
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.enableJavaScript === true)
  waitForSelector?: string;

  @ApiProperty({
    description:
      'Maximum time to wait for content (milliseconds) (only relevant when enableJavaScript is true)',
    minimum: 1000,
    maximum: 60000,
    required: false,
    default: 30000,
  })
  @IsOptional()
  @IsNumber()
  @Min(1000)
  @Max(60000)
  @ValidateIf((o) => o.enableJavaScript === true)
  waitForTimeout?: number;

  @ApiProperty({
    description:
      'Block image loading for faster scraping (only relevant when enableJavaScript is true)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @ValidateIf((o) => o.enableJavaScript === true)
  blockImages?: boolean;

  @ApiProperty({
    description:
      'Block CSS loading for faster scraping (only relevant when enableJavaScript is true)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @ValidateIf((o) => o.enableJavaScript === true)
  blockCSS?: boolean;

  @ApiProperty({
    description:
      'Block font loading for faster scraping (only relevant when enableJavaScript is true)',
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @ValidateIf((o) => o.enableJavaScript === true)
  blockFonts?: boolean;

  @ApiProperty({
    description: 'Number of retry attempts on failure',
    minimum: 1,
    maximum: 5,
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  retries?: number;

  @ApiProperty({
    description: 'Proxy configuration for the request',
    required: false,
    example: {
      address: 'proxy.example.com',
      port: 8080,
      type: 'http',
      username: 'user',
      password: 'pass',
    },
  })
  @IsOptional()
  @IsObject()
  @ValidateNested()
  @Type(() => Object)
  proxy?: ProxyCredentials;
}
