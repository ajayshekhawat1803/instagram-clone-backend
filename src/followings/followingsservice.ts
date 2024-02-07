import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { AWSConfigsS3 } from "src/s-3/s3-config";
import { User } from "src/users/model/users.model";

@Injectable()
export class followingsService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly s3Services: AWSConfigsS3,
  ) { }


  async getFollowings(id) {
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
          localField: 'followings',
          foreignField: '_id',
          as: 'followings'
        }
      },
      {
        $unwind: '$followings'
      },
      {
        $project: {
          'followings._id': 1,
          'followings.name': 1,
          'followings.username': 1,
          'followings.photo': 1,
          _id: 0
        }
      },
      {
        $group: {
          _id: null,
          followings: { $push: '$followings' }
        }
      },
      {
        $project: {
          _id: 0,
          followings: 1
        }
      }
    ];
    const userWithFollowings = await this.userModel.aggregate(pipeline);

    const followings = userWithFollowings[0];
    followings.followings = await Promise.all(followings?.followings?.map(async (user) => {
      if (user.photo) {
        user.photo = await this.s3Services.generatePresignedUrl(user.photo)
      }
      return user;
    }))

    if (!followings) {
      throw new NotFoundException(`No follwoings Found`)
    }
    return followings;
  }
}