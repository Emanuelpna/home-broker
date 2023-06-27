import { Model } from 'mongoose';
import { Observable } from 'rxjs';
import { Asset } from '@prisma/client';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Asset as AssetModel } from './asset.schema';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(
    private prismaService: PrismaService,
    @InjectModel(AssetModel.name) private assetModel: Model<AssetModel>,
  ) {}

  getALl() {
    return this.prismaService.asset.findMany();
  }

  create(data: { id: string; symbol: string; price: number }) {
    return this.prismaService.asset.create({
      data,
    });
  }

  subscribeEvents(): Observable<{ event: 'asset-price-changed'; data: Asset }> {
    return new Observable((observer) => {
      this.assetModel
        .watch(
          [
            {
              $match: {
                operationType: 'update',
              },
            },
          ],
          {
            fullDocument: 'updateLookup',
          },
        )
        .on('change', async (data) => {
          console.log(data);
          const asset = await this.prismaService.asset.findUnique({
            where: {
              id: data.fullDocument._id + '',
            },
          });
          observer.next({ event: 'asset-price-changed', data: asset });
        });
    });
  }
}
