import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { AuthGuard } from './guards/auth.guard';
import { GetUser } from './decorator/user.decorator';
import { Roles } from './decorator/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Auth } from './decorator/auth.decorator';
import { User, UserRole } from '@prisma/client';
import { GetToken } from './decorator/token.decorator';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @Post('signup')
  SignUp(@Body() signUpDto: SignUpDto) {


    return this.authService.signUp(signUpDto);
  }


  @Post('signin')
  SignIn(@Body() signInDto: SignInDto) {
    return this.authService.signIn(signInDto);
  }


  @Get('status')
  @UseGuards(AuthGuard)
  status(@GetToken() token: string, @GetUser() user: User) {

    return this.authService.checkStatus(token, user);

  }

}
