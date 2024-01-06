import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { NotFoundError } from 'rxjs';
import { Posts } from 'src/posts/model/posts.model';
import { User } from 'src/users/model/users.model';

@Injectable()
export class CommentsService {
    constructor(
        @InjectModel(Posts.name) private readonly postsModel: Model<Posts>,
        @InjectModel(User.name) private readonly UserModel: Model<User>,
    ) { }


    async addComment(reqUser, postId, postOwnerId, comment) {
        let postDocument: any = await this.postsModel.findOneAndUpdate(
            {
                user: new Types.ObjectId(postOwnerId),
                '_id': new Types.ObjectId(postId)
            },
            {
                $push: {
                    'metaData.comments': { user: new Types.ObjectId(reqUser), comment: comment }
                }
            },
            {
                new: true
            }
        )
        if (!postDocument) {
            throw new NotFoundException(`No relevent Post Found`)
        }


        // Add Comment Notification
        if (postOwnerId !== reqUser && postOwnerId && reqUser) {
            await this.UserModel.findByIdAndUpdate(postOwnerId, { $push: { 'notifications': { $each: [{ from: new Types.ObjectId(reqUser), type: "comment", postId: new Types.ObjectId(postId) }], $position: 0, $slice: 100, } } }, { new: true })
            // $push: {'notifications': { from: new Types.ObjectId(reqUser), type: "comment", postId: new Types.ObjectId(postId) }}
        }

        
        return postDocument
    }


    async getComments(postId, postOwnerId) {
        const pipeline = [
            {
                '$match': {
                    '_id': new Types.ObjectId(postId),
                    'user': new Types.ObjectId(postOwnerId)
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'metaData.comments.user',
                    'foreignField': '_id',
                    'as': 'userDetails'
                }
            }, {
                '$addFields': {
                    'metaData.comments': {
                        '$map': {
                            'input': '$metaData.comments',
                            'as': 'comment',
                            'in': {
                                'user': {
                                    '_id': '$$comment.user',
                                    'username': {
                                        '$arrayElemAt': [
                                            {
                                                '$map': {
                                                    'input': '$userDetails',
                                                    'as': 'userDetail',
                                                    'in': '$$userDetail.username'
                                                }
                                            }, {
                                                '$indexOfArray': [
                                                    '$userDetails._id', '$$comment.user'
                                                ]
                                            }
                                        ]
                                    }
                                },
                                'comment': '$$comment.comment'
                            }
                        }
                    }
                }
            }, {
                '$project': {
                    'userDetails': 0
                }
            }
        ]
        const postDocument = await this.postsModel.aggregate(pipeline).exec()
        console.log(postDocument);

        if (postDocument.length < 1) {
            throw new NotFoundException(`No Post Found`)
        }

        return postDocument[0]
    }
}
