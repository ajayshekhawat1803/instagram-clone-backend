import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { User } from './model/users.model';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/users.dto';
import { UserFeed } from 'src/user-feed/model/user-feed.model';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly UserModel: Model<User>,
        @InjectModel(UserFeed.name)
        private readonly UserFeedModel: Model<UserFeed>
    ) { }

    // Register User
    async registerUser(userData): Promise<object | null> {
        const { username, password, name, email } = userData;

        const check = await this.UserModel.find({ $or: [{ username: username }, { email: email }] })
        if (check.length > 0) {
            check.forEach((user) => {
                if (user.email === email) {
                    // throw new UnprocessableEntityException(`email already registered`)
                    throw new HttpException(`email already registered`, HttpStatus.CONFLICT)
                }
                if (user.username === username) {
                    // throw new UnprocessableEntityException(`username already taken`)
                    throw new HttpException(`username already taken`, HttpStatus.CONFLICT)
                }
            })
            return null
        }
        const saltOrRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltOrRounds);
        const result = await this.UserModel.create({
            name,
            email,
            password: hashedPassword,
            username,
            photo: '',
            bio: ''
        });
        if (result._id) {
            const feed = await this.UserFeedModel.create({ user: result._id })
            result.feed = feed._id
        }
        // Save the updated user
        await result.save();

        return result
    }


    // Update User's details
    async editUser(data: UpdateUserDto, id, req): Promise<Object | null> {
        // console.log(data,"====================================");
        
        try {
            id = new Types.ObjectId(id)
        } catch (error) {
            throw new UnprocessableEntityException(`Provide valid User ID`)
        }
        if (req.user._id !== id.toString()) {
            throw new UnauthorizedException(`Unauthorised to update User`)
        }
        const check = await this.UserModel.findOne({ _id: id })

        if (!check) {
            throw new NotFoundException(`No user found with the given query`)
        }
        let fieldsTOUpdate = {};
        for (const key in data) {
            // console.log(`Key: ${key}, Value: ${data[key]}`);
            if (!(data[key] == null)) {
                fieldsTOUpdate[key] = data[key];
            }
        }
        // console.log(fieldsTOUpdate);
        if (fieldsTOUpdate['username'] || fieldsTOUpdate['email']) {
            const check = await this.UserModel.find({ $or: [{ username: fieldsTOUpdate['username'], _id: { $ne: id } }, { email: fieldsTOUpdate['email'], _id: { $ne: id } }] })
            if (check.length > 0) {
                check.forEach((user) => {
                    if (user.email === fieldsTOUpdate['email']) {
                        throw new UnprocessableEntityException(`email already registered`)
                    }
                    if (user.username === fieldsTOUpdate['username']) {
                        throw new UnprocessableEntityException(`username already taken`)
                    }
                })
            }
        }
        const updatedUser = await this.UserModel.findByIdAndUpdate(
            id,
            { $set: fieldsTOUpdate },
            { new: true }
        )
        return updatedUser;
    }


    // Get User details by userId
    async getUserByID(id): Promise<Object | null> {
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
                    'name': 1,
                    'username': 1,
                    'photo': 1,
                    'bio': 1,
                    'posts': 1,
                    'followers': 1,
                    'followings': 1
                }
            }
        ]
        let check = await this.UserModel.aggregate(pipeline).exec()
        if (!check[0]) {
            throw new NotFoundException(`No user found`)
        }
        return check[0];
    }
    // Get User details by userId for notifications
    async getUserByIDForNotifications(id): Promise<Object | null> {
        const pipeline = [
            {
                '$match': {
                    '_id': new Types.ObjectId(id)
                }
            }, {
                '$project': {
                    '_id': 1,
                    'username': 1,
                    'photo': 1,
                    'followers': 1
                }
            }
        ]
        let check = await this.UserModel.aggregate(pipeline).exec()
        if (!check[0]) {
            throw new NotFoundException(`No user found`)
        }
        return check[0];
    }

    async getUserByUsername(username): Promise<Object | null> {
        const pipeline: any[] = [
            {
                $match: {
                    username: username,
                },
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'posts',
                    foreignField: '_id',
                    as: 'posts',
                },
            },
            {
                $unwind: {
                    path: '$posts',
                    preserveNullAndEmptyArrays: true, // Preserve documents with no matching posts
                },
            },
            {
                $sort: {
                    'posts.createdAt': 1,
                },
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    username: { $first: '$username' },
                    photo: { $first: '$photo' },
                    bio: { $first: '$bio' },
                    posts: { $push: '$posts' },
                    followers: { $first: '$followers' },
                    followings: { $first: '$followings' },
                },
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    username: 1,
                    photo: 1,
                    bio: 1,
                    followers: 1,
                    followings: 1,
                    posts: {
                        $ifNull: ['$posts', []], // If posts is null, return an empty array
                    },
                },
            },
        ] as any;


        const check: any = await this.UserModel.aggregate(pipeline).exec()
        // console.log(check);

        if (!check[0]) {
            throw new NotFoundException(`No user found`)
        }
        return check[0];
    }
    async getUserForEdit(userID): Promise<Object | null> {
        const check: any = await this.UserModel.findOne({ _id: userID }, { password: 0, feed: 0, notifications: 0, followings: 0, followers: 0, posts: 0 }).exec()
        // console.log(check);

        if (!check) {
            throw new NotFoundException(`No user found`)
        }
        return check;
    }



    async getAllUsers() {
        let allUsers = await this.UserModel.find({}, { _id: 1, username: 1, photo: 1, name: 1, followers: 1 })
        allUsers = this.advancedShuffleArray(allUsers)
        return allUsers
    }


    advancedShuffleArray(array) {
        let currentIndex = array.length;
        while (currentIndex !== 0) {

            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}
