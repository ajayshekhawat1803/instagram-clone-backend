import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { Posts } from "src/posts/model/posts.model";
import { User } from "src/users/model/users.model";

@Injectable()
export class LikesService {
    constructor(
        @InjectModel(Posts.name) private readonly PostsModel: Model<Posts>,
        @InjectModel(Posts.name) private readonly UserModel: Model<User>
    ) { }

    async handleLikes(reqUser, postId, postOwnerId) {

        const check = await this.PostsModel.findOne({
            user: postOwnerId,
            _id: new Types.ObjectId(postId),
            'metaData.likes': { $elemMatch: { $eq: reqUser } }
        });

        let postDocument;
        if (check) {
            console.log("Like removed");
            postDocument = await this.PostsModel.findOneAndUpdate(
                {
                    user: postOwnerId,
                    '_id': new Types.ObjectId(postId)
                },
                {
                    $pull: {
                        'metaData.likes': reqUser
                    }
                },
                {
                    new: true
                }
            );
            if (!postDocument) {
                throw new NotFoundException(`No post found`)
            }
        }
        else {
            console.log("Like added");

            postDocument = await this.PostsModel.findOneAndUpdate(
                {
                    user: postOwnerId,
                    '_id': new Types.ObjectId(postId)
                },
                {
                    $addToSet: {
                        'metaData.likes': reqUser
                    }
                },
                {
                    new: true
                }
            );
            if (!postDocument) {
                throw new NotFoundException(`No post found`)
            }

            // Add Like Notification
            if (postOwnerId !== reqUser && postOwnerId && reqUser) {
                const notification = await this.UserModel.findByIdAndUpdate(
                    postOwnerId,
                    {
                        $addToSet: {
                            'notifications': { from: new Types.ObjectId(reqUser), type: "like", postId: new Types.ObjectId(postId) }
                        }
                    },
                    {
                        new: true
                    }
                )
            }
        }

        return postDocument
    }
}