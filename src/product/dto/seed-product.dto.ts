import { Type } from "class-transformer";
import { IsNumber, IsOptional, Max, Min } from "class-validator";



export class SeedProductDto {



    @IsNumber()
    @IsOptional()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    count?: number

}