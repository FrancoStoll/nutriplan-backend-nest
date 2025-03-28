import { IsString } from "class-validator";


export class HasPurchaseDto {


    @IsString()
    productId: string;

    @IsString()
    userId: string;

}