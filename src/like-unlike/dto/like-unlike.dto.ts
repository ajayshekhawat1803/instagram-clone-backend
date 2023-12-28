import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class LikeUnlikeDto {
    @IsNotEmpty()
    @IsMongoId()
    postId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    postOwnerId: mongoose.Schema.Types.ObjectId
}