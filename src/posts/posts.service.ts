import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Posts } from "./model/posts.model";
import { Model, Types } from "mongoose";
import { User } from "src/users/model/users.model";

@Injectable()
export class PostsService {
    constructor(
        @InjectModel(Posts.name) private readonly postsModel: Model<Posts>,
        @InjectModel(User.name) private readonly userModel: Model<User>) { }

    // Create the post
    async createPost(userfromrequest, data, Postfiles) {
        let { user, caption } = data
        if (userfromrequest !== user) {
            throw new UnauthorizedException(`Unauthorised to add posts`)
        }
        user = new Types.ObjectId(user)
        let files = []
        Postfiles.forEach(file => {
            files.push(file.filename)
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
            const userUpdate = await this.userModel.findByIdAndUpdate(
                user,
                { $push: { posts: result._id } },
                { new: true }
            );
        }
        return result
    }

    async getAllPostsByUserID(id) {
        const pipeline = [
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
            }, {
                '$project': {
                    '_id': 1,
                    'username': 1,
                    'photo': 1,
                    'posts': 1,
                }
            }
        ]
        const userWithPosts = await this.userModel.aggregate(pipeline).exec()
        console.log(userWithPosts);

        return userWithPosts[0];
    }
}