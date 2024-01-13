import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/model/users.model';
import { AuthController } from './auth.controller';
import { UserService } from 'src/users/users.service';
import { Posts, PostsSchema } from 'src/posts/model/posts.model';
import { UserFeed, UserFeedSchema } from 'src/user-feed/model/user-feed.model';
import { AWSConfigsS3 } from 'src/s-3/s3-config';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Posts.name, schema: PostsSchema },{ name: UserFeed.name, schema: UserFeedSchema }]),
    JwtModule.register({
      // secret: process.env.SECREAT_KEY,
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' }
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService,AWSConfigsS3]
})
export class AuthModule { }
