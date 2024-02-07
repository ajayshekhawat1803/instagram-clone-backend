import { ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Posts } from "src/posts/model/posts.model";
import { AWSConfigsS3 } from "src/s-3/s3-config";
import { UserFeed } from "src/user-feed/model/user-feed.model";
import { User } from "src/users/model/users.model";

@Injectable()
export class followersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
    @InjectModel(Posts.name) private readonly PostsModel: Model<Posts>,
    @InjectModel(UserFeed.name) private readonly userFeedModel: Model<UserFeed>,
    private readonly s3Services: AWSConfigsS3,
    ) { }

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


    if (UpdateOther && UpdateSelf) {                                      // Add other user posts to self users feed
      let allOtherUserPosts: any = await this.PostsModel.find({ user: other })
      allOtherUserPosts = allOtherUserPosts.map((post) => {
        return ({ postId: post._id, user: post?.user })
      })

      const selfuserFeed = await this.userFeedModel.findOneAndUpdate(
        { user: self },
        { $push: { feed: { $each: allOtherUserPosts } } },
        { new: true }
      );
    }

    if (!UpdateOther) {
      await this.userModel.findByIdAndUpdate(
        self,
        { $pull: { followings: new Types.ObjectId(other) } },
        { new: true }
      )
      throw new UnprocessableEntityException(`Other User Does not exists in real`)
    }

    // Add Follow Notification
    await this.userModel.findByIdAndUpdate(other, { $pull: { 'notifications': { from: new Types.ObjectId(self), type: "follow", } } }, { new: true })
    await this.userModel.findByIdAndUpdate(other, { $push: { 'notifications': { $each: [{ from: new Types.ObjectId(self), type: "follow" }], $position: 0, $slice: 100, } } }, { new: true })
    // $push: { 'notifications': { from: new Types.ObjectId(self), type: "follow" }}

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

    if (UpdateOther && UpdateSelf) {                                      // Add other user posts to self users feed
      let allOtherUserPosts: any = await this.PostsModel.find({ user: other })
      allOtherUserPosts = allOtherUserPosts.map((post) => {
        return ({ postId: post._id, user: post?.user })
      })

      const selfuserFeed = await this.userFeedModel.findOneAndUpdate(
        { user: self },
        { $pullAll: { feed: allOtherUserPosts } },
        { new: true }
      );

    }

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
    followers.followers = await Promise.all(followers?.followers?.map(async (user) => {
      if (user.photo) {
        user.photo = await this.s3Services.generatePresignedUrl(user.photo)
      }
      return user;
    }))

    if (!followers) {
      throw new NotFoundException(`No Followers Found`)
    }
    return followers;
  }
}