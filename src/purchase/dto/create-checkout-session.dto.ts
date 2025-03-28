import { IsEmail, IsOptional, IsString } from "class-validator";




export class CreateCheckoutSessionDto {


    @IsString()
    productId: string;

    @IsEmail()
    @IsOptional()
    email?: string;

    @IsString()
    @IsOptional()
    userId: string
}