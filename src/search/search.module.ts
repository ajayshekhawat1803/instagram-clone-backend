import { Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/model/users.model';
import { AWSConfigsS3 } from 'src/s-3/s3-config';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],
  controllers: [SearchController],
  providers: [SearchService,AWSConfigsS3]
})
export class SearchModule { }
