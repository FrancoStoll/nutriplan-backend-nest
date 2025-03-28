import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class DashboardService {

    constructor(
        private readonly prisma: PrismaService,

    ) { }


    async getPurchases() {

        const purchases = await this.prisma.purchase.findMany()

        return purchases
    }



}
