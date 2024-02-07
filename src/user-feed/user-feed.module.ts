import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UserFeed, UserFeedSchema } from "./model/user-feed.model";
import { UserFeedService } from "./user-feed.service";
import { UserFeedController } from "./user-feed.controller";
import { AWSConfigsS3 } from "src/s-3/s3-config";

@Module({
    imports: [
        MongooseModule.forFeature([{ name: UserFeed.name, schema: UserFeedSchema }])
    ],
    controllers: [UserFeedController],
    providers: [UserFeedService,AWSConfigsS3]
})
export class UserFeedModule { }