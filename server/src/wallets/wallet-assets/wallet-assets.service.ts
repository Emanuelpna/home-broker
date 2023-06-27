import { Observable } from 'rxjs';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { WalletAsset } from '@prisma/client';
import { InjectModel } from '@nestjs/mongoose';

import { PrismaService } from 'src/prisma/prisma.service';

import { WalletAsset as WalletAssetModel } from './wallet-asset.schema';

@Injectable()
export class WalletAssetsService {
  constructor(
    private prismaService: PrismaService,
    @InjectModel(WalletAssetModel.name)
    private walletAssetModule: Model<WalletAssetModel>,
  ) {}

  getALl(filter: { wallet_id: string }) {
    return this.prismaService.walletAsset.findMany({
      where: {
        wallet_id: filter.wallet_id,
      },
      include: {
        Asset: {
          select: {
            id: true,
            price: true,
            symbol: true,
          },
        },
      },
    });
  }

  create(input: { wallet_id: string; asset_id: string; shares: number }) {
    return this.prismaService.walletAsset.create({
      data: { ...input, version: 1 },
    });
  }

  subscribeEvents(wallet_id: string): Observable<{
    event: 'wallet-asset-updated';
    data: WalletAsset;
  }> {
    return new Observable((observer) => {
      this.walletAssetModule
        .watch(
          [
            {
              $match: {
                operationType: 'update',
                'fullDocument.wallet_id': wallet_id,
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => {
          const walletAsset = await this.prismaService.walletAsset.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });

          observer.next({
            event: 'wallet-asset-updated',
            data: walletAsset,
          });
        });
    });
  }
}
