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

    @Prop({ type: mongoose.Schema.Types.ObjectId })
    posts: mongoose.Schema.Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User)