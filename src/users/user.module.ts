import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './model/users.model';
import { Posts, PostsSchema } from 'src/posts/model/posts.model';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema },{ name: Posts.name, schema: PostsSchema }])],
  controllers: [UserController],
  providers: [UserService]
})
export class UserModule { }
