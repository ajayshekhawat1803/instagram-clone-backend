import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './model/users.model';
import { Posts, PostsSchema } from 'src/posts/model/posts.model';
import { UserFeed, UserFeedSchema } from 'src/user-feed/model/user-feed.model';
import { NotificationsController } from 'src/notifications/notifications.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Posts.name, schema: PostsSchema },{ name: UserFeed.name, schema: UserFeedSchema }]),
  ],
  controllers: [UserController,NotificationsController],
  providers: [UserService]
})
export class UserModule { }
