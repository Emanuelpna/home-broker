import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AssetsService } from './assets.service';
import { Asset, AssetSchema } from './asset.schema';
import { AssetsController } from './assets.controller';

import {
  AssetDaily,
  AssetDailySchema,
} from './assets-daily/asset-daily.schema';
import { AssetsDailyService } from './assets-daily/assets-daily.service';
import { AssetsDailyController } from './assets-daily/assets-daily.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Asset.name, schema: AssetSchema },
      { name: AssetDaily.name, schema: AssetDailySchema },
    ]),
  ],
  controllers: [AssetsController, AssetsDailyController],
  providers: [AssetsService, AssetsDailyService],
  exports: [AssetsService],
})
export class AssetsModule {}
