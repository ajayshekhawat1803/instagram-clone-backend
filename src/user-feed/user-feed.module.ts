import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserFeed, UserFeedSchema } from "./model/user-feed.model";
import { UserFeedService } from "./user-feed.service";
import { UserFeedController } from "./user-feed.controller";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserFeed.name, schema: UserFeedSchema }])
    ],
    providers: [UserFeedService],
    controllers: [UserFeedController]
})
export class UserFeedModule { }