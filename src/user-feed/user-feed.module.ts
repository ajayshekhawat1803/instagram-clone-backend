import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserFeed, UserFeedSchema } from "./model/user-feed.model";
import { UserFeedService } from "./user-feed.service";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserFeed.name, schema: UserFeedSchema }])
    ],
    providers: [UserFeedService]
})
export class UserFeedModule { }