import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { followersController } from "./followers.controller";
import { followersService } from "./followers.service";
import { User, UserSchema } from "src/users/model/users.model";
import { UserFeed, UserFeedSchema } from "src/user-feed/model/user-feed.model";
import { Posts, PostsSchema } from "src/posts/model/posts.model";

@Module({
    imports: [MongooseModule.forFeature([
        { name: User.name, schema: UserSchema },
        { name: Posts.name, schema: PostsSchema },
        { name: UserFeed.name, schema: UserFeedSchema }
    ])],
    controllers: [followersController],
    providers: [followersService]
})
export class followersModule {

}