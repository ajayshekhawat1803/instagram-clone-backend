import { IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class RemoveFollowerDto {
    @IsNotEmpty()
    @IsMongoId()
    self: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    @IsMongoId()
    other: mongoose.Schema.Types.ObjectId;

}