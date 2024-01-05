import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Document } from "mongoose";

@Schema({ timestamps: true, versionKey: false })
export class User extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    password: string;

    @Prop({ required: true })
    email: string;

    @Prop({ required: true })
    username: string;

    @Prop()
    mobile: number;

    @Prop()
    dob: string;

    @Prop()
    photo: string;

    @Prop()
    bio: string;

    @Prop({ type: Object })
    metaData: Object;

    @Prop({ type: Array<mongoose.Schema.Types.ObjectId>,default:[] })
    posts: mongoose.Schema.Types.ObjectId[];

    @Prop({ type: Array, default: [] })
    followers: Array<mongoose.Schema.Types.ObjectId>;

    @Prop({ type: Array, default: [] })
    followings: Array<mongoose.Schema.Types.ObjectId>;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    messages: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    feed: mongoose.Schema.Types.ObjectId;

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    stories: mongoose.Schema.Types.ObjectId;

    @Prop({type:Array<{}>,default:[]})
    notifications:Array<{}>
}

export const UserSchema = SchemaFactory.createForClass(User)