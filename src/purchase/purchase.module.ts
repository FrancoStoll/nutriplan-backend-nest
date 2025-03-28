import { Module } from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { PurchaseController } from './purchase.controller';
import { MailModule } from 'src/mail/mail.module';
import { CommonModule } from 'src/common/common.module';
import { ProductModule } from 'src/product/product.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [PurchaseController],
  providers: [PurchaseService],
  imports: [MailModule, CommonModule, ProductModule, UserModule]
})
export class PurchaseModule {}
