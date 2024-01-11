import { Module } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { PostsController } from "./posts.controller";
import { MongooseModule } from "@nestjs/mongoose";
import { Posts, PostsSchema } from "./model/posts.model";
import { User, UserSchema } from "src/users/model/users.model";
import { UserFeed, UserFeedSchema } from "src/user-feed/model/user-feed.model";
import { AWSConfigsS3 } from "src/s-3/s3-config";

@Module({
    imports: [MongooseModule.forFeature([
        { name: Posts.name, schema: PostsSchema },
        { name: User.name, schema: UserSchema },
        { name: UserFeed.name, schema: UserFeedSchema }
    ])],
    controllers: [PostsController],
    providers: [PostsService,AWSConfigsS3]
})
export class PostsModule {

}