import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Posts, PostsSchema } from "./model/posts.model";

@Module({
    imports: [MongooseModule.forFeature([{ name: Posts.name, schema: PostsSchema }])],
    controllers: [PostsController],
    providers: [PostsService]
})
export class PostsModule {

}