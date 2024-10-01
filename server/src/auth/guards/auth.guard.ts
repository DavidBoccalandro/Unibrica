import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PUBLIC_KEY } from 'src/constants/key-decorators';
import { UsersService } from 'src/users/services/users.service';
import { IUseToken } from '../interfaces/auth.interface';
import { useToken } from 'src/utils/use.token';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService, private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get<boolean>(PUBLIC_KEY, context.getHandler());
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<Request>();
    const httpOnlyCookie = req.headers['cookie'];

    const cookies = httpOnlyCookie.split(';');
    let token: string | undefined;

    for (const cookie of cookies) {
      const [key, value] = cookie.trim().split('=');
      if (key === 'access_token') {
        token = value;
        break;
      }
    }

    if (!token) {
      throw new UnauthorizedException('Token not found in cookies');
    }

    const manageToken: IUseToken | string = useToken(token);

    if (typeof manageToken === 'string') {
      throw new UnauthorizedException(manageToken);
    }

    if (manageToken.isExpired) {
      throw new UnauthorizedException('Token is expired.');
    }

    const { sub } = manageToken;
    const user = await this.userService.findUserById(sub);

    if (!user) {
      throw new UnauthorizedException('Invalid User');
    }

    req.idUser = user.id;
    req.roleUser = user.role.id;
    return true;
  }
}
