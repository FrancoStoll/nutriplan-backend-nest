import { Module } from '@nestjs/common';

;
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductModule } from './product/product.module';
import { MailService } from './mail/mail.service';
import { PurchaseModule } from './purchase/purchase.module';
import { MailModule } from './mail/mail.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [AuthModule, UserModule, CommonModule, ProductModule, PurchaseModule, MailModule, DashboardModule],
  controllers: [],
  providers: [MailService],
})
export class AppModule { }
