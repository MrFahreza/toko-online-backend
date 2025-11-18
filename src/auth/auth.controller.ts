import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiBody,
} from '@nestjs/swagger';
import { UnauthorizedException } from '@nestjs/common';
import { LoginDto } from './dto/login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@ApiTags('1. Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //Endpoint untuk login
    @ApiOperation({ summary: 'Login user dan dapatkan JWT' })
  @ApiOkResponse({
    description: 'Login berhasil, mengembalikan token JWT.',
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Kredensial salah.' })
  @ApiBody({ type: LoginDto })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  async signIn(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Kredensial tidak valid');
    }
    return this.authService.login(user);
  }
}