import { DynamicModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

export interface DatabaseModuleOptions {
  connectionName?: string;
  uri?: string;
}

@Module({})
export class DatabaseModule {
  static forRoot(options: DatabaseModuleOptions = {}): DynamicModule {
    const {
      connectionName = 'default',
      uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/Nutscrape',
    } = options;

    return {
      module: DatabaseModule,
      imports: [
        MongooseModule.forRootAsync({
          connectionName,
          useFactory: () => ({
            uri,
            retryWrites: true,
            w: 'majority',
          }),
        }),
      ],
      exports: [MongooseModule],
    };
  }
}
