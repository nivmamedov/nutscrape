import type { ProxyCredentials } from '@app/nutscrapedb';
import { UserAgentType } from '@app/nutscrapedb';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateStaticScrapeDto {
  @ApiProperty({
    description: 'The URL to scrape',
    example: 'https://google.com',
  })
  @IsUrl()
  url: string;

  @ApiProperty({
    description: 'User agent to use for the request',
    enum: Object.keys(UserAgentType),
    required: false,
    example: 'CURL',
  })
  @IsOptional()
  @IsEnum(Object.keys(UserAgentType))
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
    description: 'Number of retry attempts on failure',
    minimum: 1,
    maximum: 10,
    required: false,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
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
