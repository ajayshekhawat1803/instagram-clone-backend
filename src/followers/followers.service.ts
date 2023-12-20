import { ForbiddenException, Injectable, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { User } from "src/users/model/users.model";

@Injectable()
export class followersService {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    async startFollowing(req, data) {
        const { self, other } = data;
        if (req.user._id !== data.self) {
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
        console.log(UpdateOther?.followers?.length);
        return UpdateOther?.followers?.length
    }


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
        return UpdateOther?.followers?.length
    }
}