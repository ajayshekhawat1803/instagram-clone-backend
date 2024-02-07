import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { followingsController } from "./followings.controller";
import { followingsService } from "./followingsservice";
import { User, UserSchema } from "src/users/model/users.model";
import { AWSConfigsS3 } from "src/s-3/s3-config";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [followingsController],
    providers: [followingsService,AWSConfigsS3]
})
export class followingsModule {

}