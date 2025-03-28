import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { CommonModule } from 'src/common/common.module';
import { AuthModule } from 'src/auth/auth.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ProductController],
  providers: [ProductService],
  imports: [CommonModule, AuthModule, UserModule],
})
export class ProductModule { }
