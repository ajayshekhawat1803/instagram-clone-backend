import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class UpdateUserDto {
    // Required Fields
    // @IsMongoId()
    // @IsNotEmpty()
    // id: mongoose.Schema.Types.ObjectId;

    @IsOptional()
    @IsNumber()
    mobile: number;

    @IsOptional()
    @IsString()
    dob: string;

    @IsOptional()
    @IsString()
    photo: string;

}