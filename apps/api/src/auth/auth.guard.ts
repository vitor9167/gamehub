import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context
      .switchToHttp()
      .getRequest();

    const authorization =
      request.headers.authorization;

    if (!authorization) {
      throw new UnauthorizedException(
        'Token não informado.',
      );
    }

    const [type, token] =
      authorization.split(' ');

    if (
      type !== 'Bearer' ||
      !token
    ) {
      throw new UnauthorizedException(
        'Token inválido.',
      );
    }

    try {
      const payload =
        await this.jwtService.verifyAsync(
          token,
          {
            secret:
              process.env.JWT_SECRET,
          },
        );

      const user =
        await this.prisma.user.findUnique({
          where: {
            id: payload.sub,
          },

          select: {
            id: true,
            username: true,
            email: true,
            role: true,
          },
        });

      if (!user) {
        throw new UnauthorizedException(
          'Usuário não encontrado.',
        );
      }

      // ESSA PARTE É FUNDAMENTAL
      request.user = {
        sub: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      };

      return true;
    } catch (error) {
      if (
        error instanceof
        UnauthorizedException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        'Token inválido ou expirado.',
      );
    }
  }
}