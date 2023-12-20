import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({ timestamps: true, versionKey: false, collection: `followers` })
export class Followers extends Document {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    user: mongoose.Schema.Types.ObjectId;

    @Prop({ default: [] })
    followers: Array<mongoose.Schema.Types.ObjectId>
}

export const followersSchema = SchemaFactory.createForClass(Followers)