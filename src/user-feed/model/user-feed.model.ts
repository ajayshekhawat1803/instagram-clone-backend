import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({ timestamps: true, versionKey: false, collection: `user_feeds` })
export class UserFeed extends Document {

    @Prop({ type: mongoose.Schema.Types.ObjectId, required: true })
    user: mongoose.Schema.Types.ObjectId

    @Prop({ type: Array<{ postId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId }>, default: [] })
    feed: Array<{ postId: mongoose.Schema.Types.ObjectId, userId: mongoose.Schema.Types.ObjectId }>
}

export const UserFeedSchema = SchemaFactory.createForClass(UserFeed)