import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/model/users.model';
import { AuthController } from './auth.controller';
import { UserService } from 'src/users/users.service';
import { Posts, PostsSchema } from 'src/posts/model/posts.model';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }, { name: Posts.name, schema: PostsSchema }]),
    JwtModule.register({
      // secret: process.env.SECREAT_KEY,
      secret: 'secretKey',
      signOptions: { expiresIn: '1h' }
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService]
})
export class AuthModule { }
