import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // Obtiene los roles permitidos desde el decorador @Roles
    const requiredRoles = this.reflector.get<string[]>('roles', ctx.getHandler());
    if (!requiredRoles) {
      return true; // Si no hay roles especificados, permite el acceso
    }

    // Obtiene el usuario del request
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Verifica si el usuario tiene uno de los roles requeridos
    const hasRole = requiredRoles.some((role) => user.role?.includes(role));
    if (!hasRole) {
      throw new ForbiddenException('No tienes permiso para acceder a este recurso');
    }

    return true;
  }
}