import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { SignUpDto } from './dto/sign-up.dto';
import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { PasswordService } from 'src/common/services/password.service';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';


@Injectable()
export class AuthService {

  constructor(
    private readonly userService: UserService,
    private readonly passwordService: PasswordService,
    private readonly jwtService: JwtService
  ) { }

  async signUp(signUpDto: SignUpDto) {

    return "signup"

  }


  async signIn(signInDto: SignInDto) {

    const { email, password } = signInDto

    const user = await this.userService.findByEmail(email)

    if (!user) throw new BadRequestException("User not found")

    const validPassword = await this.passwordService.compare(password, user.password)

    if (!validPassword) throw new UnauthorizedException("Invalid credentials")

    const { password: __, ...rest } = user

    const payload = { id: user.id, email: user.email, name: user.name, role: user.role }


    return {
      user: rest,
      access_token: await this.jwtService.signAsync(payload)
    }
  }


  async checkStatus(token: string, user: User) {



    const {id, email, name} = await this.jwtService.verifyAsync(token)

    const newToken = await this.jwtService.signAsync({id, email, name})

    return {user, access_token: newToken}

  }

}
