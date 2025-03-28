import { Injectable } from "@nestjs/common";
import * as bcrypt from 'bcrypt'
@Injectable()
export class PasswordService {

    private readonly saltRound = 10;


    async hash(password: string): Promise<string> {
        return bcrypt.hash(password, this.saltRound);
    }

    async compare(password: string, hash: string): Promise<Boolean> {

        return bcrypt.compare(password, hash);
    }

}