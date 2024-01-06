import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Posts, PostsSchema } from 'src/posts/model/posts.model';
import { User, UserSchema } from 'src/users/model/users.model';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Posts.name, schema: PostsSchema },
    { name: User.name, schema: UserSchema },
  ])],
  providers: [CommentsService],
  controllers: [CommentsController]
})
export class CommentsModule { }
