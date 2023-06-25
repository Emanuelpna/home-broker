import { Injectable } from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class WalletsService {
  constructor(private prismaService: PrismaService) {}

  getALl() {
    return this.prismaService.wallet.findMany();
  }

  create(input: { id: string }) {
    return this.prismaService.wallet.create({
      data: input,
    });
  }
}
