import { MiddlewareConsumer, Module, RequestMethod, Session } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './users/user.module';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { AuthModule } from './auth/auth.module';
import * as session from 'express-session';
import { AuthMiddleware } from './auth/auth.middleware';
import { PostsModule } from './posts/posts.module';
import { followersModule } from './followers/followers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['.env.local', '.env'],
      isGlobal: true,
      // load: [configuration],
    }),
    MongooseModule.forRoot(process.env.MONGO_DSN, {
      dbName: process.env.MONGO_DB_NAME,
    }),
    ServeStaticModule.forRoot({
      rootPath: path.resolve(__dirname, '../uploads'), // Change this path accordingly
      serveRoot: '/uploads',
    }),
    AuthModule,
    UserModule,
    PostsModule,
    followersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(session({ secret: 'secret', resave: true, saveUninitialized: true }))
      .exclude('/auth/signup', '/health')
      .forRoutes({ path: '*', method: RequestMethod.ALL });

    consumer.apply(AuthMiddleware)
      .exclude('/auth/login', '/auth/signup', '/health', '/auth/setupPassword/:email','/auth/signup/add-details/:id')
      .forRoutes('*');
  }
}
