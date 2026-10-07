import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import {
  Prisma,
} from '../generated/prisma/client';

import { PrismaService } from '../prisma/prisma.service';

import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existingEmail =
      await this.prisma.user.findUnique({
        where: {
          email: dto.email,
        },
      });

    if (existingEmail) {
      throw new ConflictException(
        'Este email já está cadastrado.',
      );
    }

    const existingUsername =
      await this.prisma.user.findUnique({
        where: {
          username: dto.username,
        },
      });

    if (existingUsername) {
      throw new ConflictException(
        'Este nome de usuário já está em uso.',
      );
    }

    const passwordHash =
      await bcrypt.hash(
        dto.password,
        10,
      );

    try {
      const user =
        await this.prisma.user.create({
          data: {
            username:
              dto.username,

            email:
              dto.email,

            passwordHash,

            displayName:
              dto.displayName,
          },

          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
          },
        });

      const accessToken =
        await this.jwtService.signAsync({
          sub: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        });

      return {
        user,
        accessToken,
      };
    } catch (error) {
      if (
        error instanceof
          Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        const target =
          Array.isArray(
            error.meta?.target,
          )
            ? error.meta.target
            : [];

        if (
          target.includes('email')
        ) {
          throw new ConflictException(
            'Este email já está cadastrado.',
          );
        }

        if (
          target.includes(
            'username',
          )
        ) {
          throw new ConflictException(
            'Este nome de usuário já está em uso.',
          );
        }

        throw new ConflictException(
          'Já existe um usuário com esses dados.',
        );
      }

      throw error;
    }
  }

 async login(dto: LoginDto) {
  const user =
    await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

  if (!user) {
    throw new UnauthorizedException(
      'Email ou senha inválidos.',
    );
  }

  const passwordMatches =
    await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

  if (!passwordMatches) {
    throw new UnauthorizedException(
      'Email ou senha inválidos.',
    );
  }

  const updatedUser =
    await this.prisma.user.update({
      where: {
        id: user.id,
      },

      data: {
        lastLoginAt: new Date(),
      },

      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        lastLoginAt: true,
        isProfilePublic: true,
        isLibraryPublic: true,
      },
    });

  const accessToken =
    await this.jwtService.signAsync({
      sub: updatedUser.id,
      username:
        updatedUser.username,
      email:
        updatedUser.email,
      role:
        updatedUser.role,
    });

  return {
    user: updatedUser,
    accessToken,
  };
}

  async getMe(userId: string) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },

        select: {
          id: true,
          username: true,
          email: true,
          displayName: true,
          bio: true,
          avatarUrl: true,
          role: true,
          createdAt: true,
          isProfilePublic: true,
          isLibraryPublic: true,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado.',
      );
    }

    return user;
  }

  async updateProfile(
    userId: string,
    dto: UpdateProfileDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado.',
      );
    }

    return this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        avatarUrl: dto.avatarUrl,
        isProfilePublic:
          dto.isProfilePublic,
        isLibraryPublic:
          dto.isLibraryPublic,
      },

      select: {
        id: true,
        username: true,
        email: true,
        displayName: true,
        bio: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
        isProfilePublic: true,
        isLibraryPublic: true,
      },
    });
  }

  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
  ) {
    const user =
      await this.prisma.user.findUnique({
        where: {
          id: userId,
        },
      });

    if (!user) {
      throw new UnauthorizedException(
        'Usuário não encontrado.',
      );
    }

    const passwordMatches =
      await bcrypt.compare(
        dto.currentPassword,
        user.passwordHash,
      );

    if (!passwordMatches) {
      throw new UnauthorizedException(
        'Senha atual incorreta.',
      );
    }

    const newPasswordHash =
      await bcrypt.hash(
        dto.newPassword,
        10,
      );

    await this.prisma.user.update({
      where: {
        id: userId,
      },

      data: {
        passwordHash:
          newPasswordHash,
      },
    });

    return {
      message:
        'Senha alterada com sucesso.',
    };
  }
}