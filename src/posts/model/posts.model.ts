import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({ timestamps: true, versionKey: false, collection: `posts` })
export class Posts extends Document {
    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId })
    user: mongoose.Schema.Types.ObjectId;

    @Prop({ required: true, default: [] })
    posts: Array<{
        caption: string,
        files: string[],
        metaData: {
            likes: Array<mongoose.Schema.Types.ObjectId>,
            commments: Array<{ comment: string, user: mongoose.Schema.Types.ObjectId }>
        }
    }>

}

export const PostsSchema = SchemaFactory.createForClass(Posts)