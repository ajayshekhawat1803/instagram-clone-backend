import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Posts } from "src/posts/model/posts.model";

@Injectable()
export class LikesService {
    constructor(
        @InjectModel(Posts.name) private readonly PostsModel: Model<Posts>
    ) { }

    async handleLikes(reqUser, postId, postOwnerId) {
        const check = await this.PostsModel.findOne(
            {
                user: postOwnerId,
                'posts.postID': new Types.ObjectId(postId),
                'posts.metaData.likes': { $elemMatch: { $eq: reqUser } }
            }
        )
        let postDocument;
        if (check) {
            postDocument = await this.PostsModel.findOneAndUpdate(
                {
                    user: postOwnerId,
                    'posts.postID': new Types.ObjectId(postId)
                },
                {
                    $pull: {
                        'posts.$.metaData.likes': reqUser
                    }
                },
                {
                    new: true
                }
            );
        }
        else {
            postDocument = await this.PostsModel.findOneAndUpdate(
                {
                    user: postOwnerId,
                    'posts.postID': new Types.ObjectId(postId)
                },
                {
                    $addToSet: {
                        'posts.$.metaData.likes': reqUser
                    }
                },
                {
                    new: true
                }
            );
        }

        // console.log(postDocument);
        if (!postDocument) {
            throw new NotFoundException(`No post found`)
        }
        const filteredPosts = postDocument.posts.filter(post => post.postID.toString() === postId);

        console.log(filteredPosts[0].metaData.likes);
    
        return filteredPosts[0];
    }
}