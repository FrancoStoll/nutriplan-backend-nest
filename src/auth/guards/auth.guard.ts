


import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { Request } from 'express';
import { UserService } from '../../user/user.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private readonly userService: UserService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);
        if (!token) {
            throw new UnauthorizedException();
        }
        try {
            const payload = await this.jwtService.verifyAsync(
                token,
                {
                    secret: process.env.JWT_SECRET,
                }
            );

            const { email } = payload

            // const user = await this.userService.findByEmail(email)

            // if (!user) throw new UnauthorizedException()
            // const { password: __, ...rest } = user

            // 💡 We're assigning the payload to the request object here
            // so that we can access it in our route handlers

            request['token'] = token

            request['user'] = payload
        } catch {
            throw new UnauthorizedException();
        }
        return true;
    }

    private extractTokenFromHeader(request: Request): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}
