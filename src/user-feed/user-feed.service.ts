import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserFeed } from "./model/user-feed.model";
import { Model, Types } from "mongoose";
import { AWSConfigsS3 } from "src/s-3/s3-config";

@Injectable()
export class UserFeedService {
    constructor(
        @InjectModel(UserFeed.name) private readonly userFeedModel: Model<UserFeed>,
        private readonly s3Services: AWSConfigsS3,
    ) { }

    async findAllPaginated(userId, skip, pageSize) {
        const pipeline = [
            {
                '$match': {
                    user: new Types.ObjectId(userId)
                }
            },
            {
                '$lookup': {
                    'from': 'posts',
                    'localField': 'feed.postId',
                    'foreignField': '_id',
                    'as': 'feed'
                }
            }, {
                '$lookup': {
                    'from': 'users',
                    'localField': 'feed.user',
                    'foreignField': '_id',
                    'as': 'userDetails'
                }
            }, {
                '$addFields': {
                    'feed': {
                        '$map': {
                            'input': '$feed',
                            'as': 'feedItem',
                            'in': {
                                '$mergeObjects': [
                                    '$$feedItem', {
                                        'userDetails': {
                                            '$arrayElemAt': [
                                                {
                                                    '$filter': {
                                                        'input': '$userDetails',
                                                        'as': 'user',
                                                        'cond': {
                                                            '$eq': [
                                                                '$$user._id', '$$feedItem.user'
                                                            ]
                                                        }
                                                    }
                                                }, 0
                                            ]
                                        }
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {
                '$addFields': {
                    'feed': {
                        '$map': {
                            'input': '$feed',
                            'as': 'feedItem',
                            'in': {
                                '$mergeObjects': [
                                    '$$feedItem', {
                                        'username': '$$feedItem.userDetails.username',
                                        'photo': '$$feedItem.userDetails.photo'
                                    }
                                ]
                            }
                        }
                    }
                }
            }, {
                '$group': {
                    '_id': '$_id',
                    'user': {
                        '$first': '$user'
                    },
                    'feed': {
                        '$first': '$feed'
                    },
                    'createdAt': {
                        '$first': '$createdAt'
                    },
                    'updatedAt': {
                        '$first': '$updatedAt'
                    }
                }
            },
            {
                '$unset': 'feed.userDetails'
            },
            // {
            //     '$addFields': {
            //         'feed': {
            //             '$slice': ['$feed', skip, pageSize]
            //         }
            //     }
            // }
        ]

        let feed: any = await this.userFeedModel.aggregate(pipeline).exec()
        feed = feed[0]
        if (feed?.feed) {
            feed.feed = await Promise.all(feed.feed?.map(async (post) => {
                if (post.photo) {
                    post.photo = await this.s3Services.generatePresignedUrl(post.photo)
                }
                post.files[0] = await this.s3Services.generatePresignedUrl(post.files[0])
                return post;
            }))
        }

        return feed;
    }
}