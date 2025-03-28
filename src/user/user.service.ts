import { BadRequestException, Injectable } from '@nestjs/common';


import { PasswordService } from 'src/common/services/password.service';
import { PrismaService } from 'src/common/services/prisma.service';
import { selectUserWithoutPassword } from 'src/common/config/user.config';

@Injectable()
export class UserService {

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwordService: PasswordService,
  ) { }

  async create(createUser: { email: string, password: string }) {

    const { email, password } = createUser

    const hashedPassword = await this.passwordService.hash(password);

    const user = await this.findByEmail(email);

    if (user) {

      throw new BadRequestException('Email already in use')
    }

    const name = email.split('@')[0]

    return await this.prisma.user.create({
      data: { email: email, password: hashedPassword, name: name },
      omit: selectUserWithoutPassword
    })

  }

  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email: email },
    })
  }

  findAll() {
    return this.prisma.user.findMany({ omit: selectUserWithoutPassword })
  }

  findOne(id: string) {

    const user = this.prisma.user.findFirst({
      where: { id },
      omit: selectUserWithoutPassword
    })

    if (!user) throw new BadRequestException("User not found");

    return user;
  }

  update(id: number, updateUser: { email: string, password: string, name: string, role: string }) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
