import { Module } from '@nestjs/common';
import { PasswordService } from './services/password.service';
import { PrismaService } from './services/prisma.service';

@Module({
    exports: [PasswordService, PrismaService],
    providers: [PasswordService, PrismaService],
})
export class CommonModule {
    
}
