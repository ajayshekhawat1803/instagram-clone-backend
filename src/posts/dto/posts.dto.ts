import { IsArray, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import mongoose from "mongoose";

export class CreatePostDto {
    @IsNotEmpty()
    @IsMongoId()
    user: mongoose.Schema.Types.ObjectId

    @IsString()
    caption: string;
}