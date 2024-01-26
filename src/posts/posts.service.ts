import { BadRequestException, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Posts } from "./model/posts.model";
import { Model, Types } from "mongoose";
import { User } from "src/users/model/users.model";
import { UserFeed } from "src/user-feed/model/user-feed.model";
import { AWSConfigsS3 } from "src/s-3/s3-config";

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Posts.name) private readonly postsModel: Model<Posts>,
        @InjectModel(User.name) private readonly userModel: Model<User>,
        @InjectModel(UserFeed.name) private readonly userFeedModel: Model<UserFeed>,
    ) { }

    // Create the post
    async createPost(userfromrequest, data, Postfiles) {
        let { user, caption } = data
        if (userfromrequest !== user) {
            throw new UnauthorizedException(`Unauthorised to add posts`)
        }
        user = new Types.ObjectId(user)
        let files = []
        Postfiles.forEach(file => {
            files.push(file.key)
        });

        const currentPost = {
            user: new Types.ObjectId(user),
            caption,
            files: files,
            metaData: {
                likes: [],
                comments: []
            }
        }
        const result = await this.postsModel.create(currentPost)

        if (result._id) {
            const userUpdate = await this.userModel.findOneAndUpdate(
                { _id: new Types.ObjectId(userfromrequest) },
                { $push: { posts: result._id } },
                { new: true }
            ).exec();
            if (!userUpdate) {
                throw new UnprocessableEntityException("Failed to fetch user")
            }
            const followers = userUpdate?.followers
            if (followers) {
                followers.map(async (follower) => {
                    await this.userFeedModel.findOneAndUpdate(
                        { user: follower },
                        { $push: { feed: { postId: result._id, user: user } } },
                        { new: true }
                    )
                })
            }
        }
        return result
    }

    async getAllPostsByUserID(id) {
        const pipeline: any = [
            {
                '$match': {
                    '_id': new Types.ObjectId(id)
                }
            }, {
                '$lookup': {
                    'from': 'posts',
                    'localField': 'posts',
                    'foreignField': '_id',
                    'as': 'posts'
                }
            },
            {
                '$project': {
                    '_id': 1,
                    'username': 1,
                    'photo': 1,
                    'posts': 1,
                }
            },
            // {
            //     $sort: {
            //         'posts.createdAt': 1,
            //     }
            // }
        ]
        let userWithPosts;
        try {
            userWithPosts = await this.userModel.aggregate(pipeline).exec()
        } catch (error) {
            throw new BadRequestException("Failed to get userData")
        }       
        return userWithPosts[0];

    }


    async getPostByPostID(id) {
        const pipeline = [
            {
                '$match': {
                    '_id': new Types.ObjectId(id)
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user',
                    'foreignField': '_id',
                    'as': 'userData'
                }
            }, {
                '$unwind': {
                    'path': '$userData',
                    'preserveNullAndEmptyArrays': true
                }
            }, {
                '$project': {
                    '_id': 1,
                    'caption': 1,
                    'metaData': 1,
                    'user': 1,
                    'username': '$userData.username',
                    'userPhoto': '$userData.photo',
                    'files': 1
                }
            }
        ]
        const Post = await this.postsModel.aggregate(pipeline).exec()
        return Post[0];
    }
}