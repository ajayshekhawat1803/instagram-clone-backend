import { Module } from "@nestjs/common";
import { LikesController } from "./Likes.controller";
import { LikesService } from "./Likes.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Posts, PostsSchema } from "src/posts/model/posts.model";

@Module({
    imports: [MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }])],
    controllers: [LikesController],
    providers: [LikesService]
})
export class LikesModule {

}