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

    async createPost(userfromrequest, data, Postfiles) {
        let { user, caption } = data
        if (userfromrequest !== user) {
            throw new UnauthorizedException(`Unauthorised to add posts`)
        }
        user = new Types.ObjectId(user)
        let posts = []
        Postfiles.forEach(file => {
            posts.push(file.filename)
        });

        const currentPost = {
            postID: new Types.ObjectId(),
            caption,
            files: posts,
            metaData: {
                likes: 0,
                Comment: []
            }
        }
        const result = await this.postsModel.findOneAndUpdate(
            { user: user },
            { $push: { posts: currentPost } },
            { new: true }
        )
        if (!result) {
            throw new NotFoundException(`No User Found`)
        }
        return result
    }


    async getAllPostsByUsername(username) {
        const pipeline = [
            {
                '$match': {
                    'username': `${username}`
                }
            },
            {
                '$lookup': {
                    'from': 'posts',
                    'localField': 'posts',
                    'foreignField': '_id',
                    'as': 'posts'
                }
            },
            {
                '$unwind': {
                    'path': '$posts',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$group': {
                    '_id': '$_id',
                    'name': {
                        '$first': '$name'
                    },
                    'username': {
                        '$first': '$username'
                    },
                    'photo': {
                        '$first': '$photo'
                    },
                    'posts': {
                        '$push': '$posts.posts'
                    }
                }
            },
            {
                '$unwind': {
                    'path': '$posts',
                    'preserveNullAndEmptyArrays': true
                }
            },
            {
                '$replaceRoot': {
                    'newRoot': {
                        '$mergeObjects': [
                            '$$ROOT', {
                                'posts': '$posts'
                            }
                        ]
                    }
                }
            },
            {
                '$project': {
                    '_id': 1,
                    'name': 1,
                    'username': 1,
                    'photo': 1,
                    'posts': 1
                }
            }
        ]
        const userWithPosts = await this.userModel.aggregate(pipeline).exec()
        console.log(userWithPosts);
        
        // const posts = userWithPosts[0]
        // if (!posts) {
        //     throw new NotFoundException(`No Posts Found`)
        // }
        return userWithPosts[0];
    }
}