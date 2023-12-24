import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "src/users/model/users.model";

@Injectable()
export class followersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    // Method to start following the other user
    async startFollowing(req, data) {
        const { self, other } = data;
        if (req.user._id !== self) {
            throw new ForbiddenException(`Access Denied`)
        }

        const UpdateSelf = await this.userModel.findByIdAndUpdate(
            self,
            { $addToSet: { followings: new Types.ObjectId(other) } },
            { new: true }
        )
        if (!UpdateSelf) {
            throw new UnprocessableEntityException(`Self User Does not exists in real`)
        }

        const UpdateOther = await this.userModel.findByIdAndUpdate(
            other,
            { $addToSet: { followers: new Types.ObjectId(self) } },
            { new: true }
        )
        if (!UpdateOther) {
            await this.userModel.findByIdAndUpdate(
                self,
                { $pull: { followings: new Types.ObjectId(other) } },
                { new: true }
            )
            throw new UnprocessableEntityException(`Other User Does not exists in real`)
        }
        return UpdateOther?.followers
    }


    // Method to remove following the other user
    async RemoveFollowing(req, data) {
        const { self, other } = data;
        if (req.user._id !== data.self) {
            throw new ForbiddenException(`Access Denied`)
        }
        const UpdateSelf = await this.userModel.findByIdAndUpdate(
            self,
            { $pull: { followings: new Types.ObjectId(other) } },
            { new: true }
        )
        if (!UpdateSelf) {
            throw new UnprocessableEntityException(`Self User Does not exists in real`)
        }
        const UpdateOther = await this.userModel.findByIdAndUpdate(
            other,
            { $pull: { followers: new Types.ObjectId(self) } },
            { new: true }
        )
        if (!UpdateOther) {
            await this.userModel.findByIdAndUpdate(
                self,
                { $addToSet: { followings: new Types.ObjectId(other) } },
                { new: true }
            )
            throw new UnprocessableEntityException(`Other User Does not exists in real`)
        }
        return UpdateOther?.followers
    }



    async getFollowers(id) {
        try {
            id = new Types.ObjectId(id)
        } catch (error) {
            throw new UnprocessableEntityException(`Invalid User Id`)
        }
        const pipeline = [
            {
              $match: { _id: id }
            },
            {
              $lookup: {
                from: 'users',
                localField: 'followers',
                foreignField: '_id',
                as: 'followers'
              }
            },
            {
              $unwind: '$followers'
            },
            {
              $project: {
                'followers._id': 1,
                'followers.name': 1,
                'followers.username': 1,
                'followers.photo': 1,
                _id: 0
              }
            },
            {
              $group: {
                _id: null,
                followers: { $push: '$followers' }
              }
            },
            {
              $project: {
                _id: 0,
                followers: 1
              }
            }
          ];
        const userWithFollowers = await this.userModel.aggregate(pipeline);
        
        const followers = userWithFollowers[0];

        if (!followers) {
            throw new NotFoundException(`No User Found`)
        }
        return followers;
    }
}