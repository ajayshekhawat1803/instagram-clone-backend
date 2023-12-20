import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { followersController } from "./followers.controller";
import { followersService } from "./followers.service";
import { User, UserSchema } from "src/users/model/users.model";

@Module({
    imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
    controllers: [followersController],
    providers: [followersService]
})
export class followersModule {

}