import { Module } from "@nestjs/common";
import { LikesController } from "./Likes.controller";
import { LikesService } from "./Likes.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Posts, PostsSchema } from "src/posts/model/posts.model";
import { User, UserSchema } from "src/users/model/users.model";

@Module({
    imports: [MongooseModule.forFeature([
        { name: Posts.name, schema: PostsSchema },
        { name: User.name, schema: UserSchema },
    ])],
    controllers: [LikesController],
    providers: [LikesService]
})
export class LikesModule {

}