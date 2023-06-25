import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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
}
