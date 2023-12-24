import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/users/model/users.model';

@Injectable()
export class SearchService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async GetUser(searchValue) {
        const regexSearchValue = new RegExp(searchValue, 'i');

        const result = await this.userModel.find(
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

        return result;
    }
}
