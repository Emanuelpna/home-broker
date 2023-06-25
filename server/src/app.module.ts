import { Module } from '@nestjs/common';

import { AppService } from './app.service';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { AssetsModule } from './assets/assets.module';
import { WalletsModule } from './wallets/wallets.module';
import { OrdersModule } from './orders/orders.module';

@Module({
  imports: [PrismaModule, AssetsModule, WalletsModule, OrdersModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
