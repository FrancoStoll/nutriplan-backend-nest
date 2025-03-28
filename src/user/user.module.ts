import { Module } from '@nestjs/common';

import { PrismaService } from 'src/common/services/prisma.service';
import { CommonModule } from 'src/common/common.module';
import { UserService } from './user.service';

@Module({
  controllers: [],
  providers: [UserService],
  imports: [CommonModule],
  exports: [UserService],
})
export class UserModule {}
