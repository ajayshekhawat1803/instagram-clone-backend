import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Posts } from "./model/posts.model";
import { Model, Types } from "mongoose";

@Injectable()
export class PostsService {
    constructor(@InjectModel(Posts.name) private readonly postsModel: Model<Posts>) { }

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
}