import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AWSConfigsS3 } from 'src/s-3/s3-config';
import { User } from 'src/users/model/users.model';

@Injectable()
export class SearchService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>,
        private readonly s3Services: AWSConfigsS3,
    ) { }

    async GetUser(searchValue) {
        const regexSearchValue = new RegExp(searchValue, 'i');
        let result = await this.userModel.find(
            {
                $or: [
                    { name: { $regex: regexSearchValue } },
                    { username: { $regex: regexSearchValue } }
                ]
            },
            {
                name: 1,
                username: 1,
                photo: 1,
                bio: 1
            });
        result = await Promise.all(result.map(async (user) => {
            if (user.photo) {
                user.photo = await this.s3Services.generatePresignedUrl(user.photo)
            }
            return user;
        }))
        console.log(result)
        return result;
    }
}
