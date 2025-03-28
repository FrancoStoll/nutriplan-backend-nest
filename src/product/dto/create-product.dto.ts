import { IsBoolean, IsEnum, IsNumber, IsOptional, IsString } from "class-validator"
import { ProductCategory } from "../interface/product.interface"
import { Category } from "@prisma/client"
import { Type } from "class-transformer"

export class CreateProductDto {

    @IsString()
    name: string

    @IsEnum(Category)
    category: ProductCategory

    @IsString()
    description: string

    @IsString()
    @IsOptional()
    pdfUrl?: string

    @IsBoolean()
    @IsOptional()
    isFree?: boolean

    @IsNumber()
    @Type(() => Number)
    @IsOptional()
    price?: number

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    days: number


}
