import { Scrape, ScrapeDocument, WaitUntilType } from '@app/nutscrapedb';
import { InjectQueue } from '@nestjs/bullmq';
import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { UUIDValidationPipe } from '../pipes/uuid-validation';
import { CreateDynamicScrapeDto } from './dto/create-dynamic-scrape.dto';
import { CreateStaticScrapeDto } from './dto/create-static-scrape.dto';
import { UserAgentMappingService } from './services/user-agent-mapping.service';

@ApiTags('scrape')
@Controller('scrape')
export class ScrapeController {
  constructor(
    @InjectQueue('scrape_jobs') private readonly scrapeQueue: Queue,
    @InjectModel(Scrape.name, 'nutscrapi')
    private scrapeModel: Model<ScrapeDocument>,
    private readonly userAgentMappingService: UserAgentMappingService,
  ) {}

  @Post('static')
  @ApiOperation({
    summary: 'Create a new static scrape job (no JavaScript execution)',
  })
  @ApiResponse({
    status: 201,
    description: 'Static scrape job created successfully',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async createStaticScrapeTask(
    @Body() createStaticScrapeDto: CreateStaticScrapeDto,
  ): Promise<string> {
    const jobId = uuidv4();

    // Convert user agent key to actual user agent string and add enableJavaScript: false
    const processedDto = {
      ...createStaticScrapeDto,
      enableJavaScript: false,
    };
    if (createStaticScrapeDto.userAgent) {
      processedDto.userAgent = this.userAgentMappingService.getUserAgentString(
        createStaticScrapeDto.userAgent,
      );
    }

    await this.scrapeQueue.add('initialize_scrape', processedDto, {
      jobId,
    });
    return jobId;
  }

  @Post('dynamic')
  @ApiOperation({
    summary: 'Create a new dynamic scrape job (with JavaScript execution)',
  })
  @ApiResponse({
    status: 201,
    description: 'Dynamic scrape job created successfully',
    type: String,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request data',
  })
  async createDynamicScrapeTask(
    @Body() createDynamicScrapeDto: CreateDynamicScrapeDto,
  ): Promise<string> {
    const jobId = uuidv4();

    // Convert user agent key to actual user agent string and add enableJavaScript: true
    const processedDto = {
      ...createDynamicScrapeDto,
      enableJavaScript: true,
    };
    if (createDynamicScrapeDto.userAgent) {
      processedDto.userAgent = this.userAgentMappingService.getUserAgentString(
        createDynamicScrapeDto.userAgent,
      );
    }
    if (createDynamicScrapeDto.waitUntil) {
      processedDto.waitUntil =
        WaitUntilType[
          createDynamicScrapeDto.waitUntil as keyof typeof WaitUntilType
        ];
    }

    await this.scrapeQueue.add('initialize_scrape', processedDto, {
      jobId,
    });
    return jobId;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get scrape job by ID' })
  @ApiParam({
    name: 'id',
    description: 'Scrape job ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Scrape job found',
    type: Scrape,
  })
  @ApiResponse({
    status: 404,
    description: 'Scrape job not found',
  })
  async getScrapeTask(
    @Param('id', UUIDValidationPipe) id: string,
  ): Promise<ScrapeDocument> {
    const scrape = await this.scrapeModel.findById(id);
    if (!scrape) {
      throw new NotFoundException('Scrape not found');
    }
    return scrape;
  }
}
