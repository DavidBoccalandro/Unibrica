import { Body, Controller, Post, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from '../services/auth.service';
import { AuthDTO } from '../dto/auth.dto';
import { addHoursToDate } from 'src/utils/date.util';
import { ApiTags } from '@nestjs/swagger';
import { PublicAccess } from '../decorator/public.decorator';

@ApiTags('Authorization')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicAccess()
  @Post('login')
  async login(@Body() { username, password }: AuthDTO, @Res({ passthrough: true }) res: Response) {
    const userValidate = await this.authService.validateUser(username, password);

    if (!userValidate) {
      throw new UnauthorizedException('Data not valid');
    }

    const jwt = await this.authService.generateJWT(userValidate);
    res.cookie('access_token', jwt.accessToken, {
      httpOnly: false,
      secure: false,
      sameSite: false,
      expires: addHoursToDate('1h'),
    });
    return jwt.user;
  }
}
