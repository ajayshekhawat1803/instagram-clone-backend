import { IsMongoId, IsNotEmpty, IsString } from "class-validator";
import mongoose from "mongoose";

export class AddCommentDto {
    @IsNotEmpty()
    @IsMongoId()
    postId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    postOwnerId: mongoose.Schema.Types.ObjectId

    @IsNotEmpty()
    @IsString()
    comment: string
}