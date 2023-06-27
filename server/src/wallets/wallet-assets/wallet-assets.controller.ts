import { Observable, map } from 'rxjs';
import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Sse,
} from '@nestjs/common';

import { WalletAssetsService } from './wallet-assets.service';

@Controller('wallets/:wallet_id/assets')
export class WalletAssetsController {
  constructor(private readonly walletAssetssService: WalletAssetsService) {}

  @Get()
  getAll(@Param('wallet_id') wallet_id: string) {
    return this.walletAssetssService.getALl({ wallet_id });
  }

  @Post()
  create(
    @Param('wallet_id') wallet_id: string,
    @Body() body: { asset_id: string; shares: number },
  ) {
    return this.walletAssetssService.create({ wallet_id, ...body });
  }

  @Sse('events')
  events(@Param('wallet_id') wallet_id: string): Observable<MessageEvent> {
    return this.walletAssetssService
      .subscribeEvents(wallet_id)
      .pipe(map((event) => ({ type: event.event, data: event.data })));
  }
}
