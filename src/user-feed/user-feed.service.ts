import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserFeed } from "./model/user-feed.model";
import { Model, Types } from "mongoose";

@Injectable()
export class UserFeedService {
    constructor(@InjectModel(UserFeed.name) private readonly userFeedModel: Model<UserFeed>) { }

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

        const feed = await this.userFeedModel.aggregate(pipeline).exec()
        return feed[0];
    }
}