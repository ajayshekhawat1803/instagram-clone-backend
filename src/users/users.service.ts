import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { User } from './model/users.model';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/auth.dto';
import { UpdateUserDto } from './dto/users.dto';
import { Posts } from 'src/posts/model/posts.model';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly UserModel: Model<User>,
        @InjectModel(Posts.name)
        private readonly PostsModel: Model<Posts>
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
        const posts = await this.PostsModel.create({ user: result._id })

        // Use bracket notation to add the 'posts' property
        result.posts = posts._id;

        // Save the updated user
        await result.save();

        return result
    }


    // Update User's details
    async editUser(data: UpdateUserDto, id, req): Promise<Object | null> {
        try {
            id = new Types.ObjectId(id)
        } catch (error) {
            throw new UnprocessableEntityException(`Provide valid User ID`)
        }
        if (req.user.user._id !== id.toString()) {
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
        try {
            id = new Types.ObjectId(id)
        } catch (error) {
            throw new UnprocessableEntityException(`Please provide a valid User ID`)
        }
        const pipeline = [
            {
                $match: {
                    _id: id
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'posts',
                    foreignField: '_id',
                    as: 'userPosts'
                }
            },
            {
                $unwind: {
                    path: '$userPosts',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    password: { $first: '$password' },
                    email: { $first: '$email' },
                    username: { $first: '$username' },
                    photo: { $first: '$photo' },
                    bio: { $first: '$bio' },
                    followers: { $first: '$followers' },
                    followings: { $first: '$followings' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    posts: { $push: '$userPosts' }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    username: 1,
                    photo: 1,
                    bio: 1,
                    followers: 1,
                    followings: 1,
                    posts: { $ifNull: ['$posts', []] } // Handle potential null values
                }
            }
        ];
        const check = await this.UserModel.aggregate(pipeline).exec()
        if (!check[0]) {
            throw new HttpException(`No used Found`, HttpStatus.NOT_FOUND)
        }
        return check[0];
    }

    async getUserByUsername(username): Promise<Object | null> {
        const pipeline = [
            {
                $match: {
                    username: username
                }
            },
            {
                $lookup: {
                    from: 'posts',
                    localField: 'posts',
                    foreignField: '_id',
                    as: 'userPosts'
                }
            },
            {
                $unwind: {
                    path: '$userPosts',
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $group: {
                    _id: '$_id',
                    name: { $first: '$name' },
                    password: { $first: '$password' },
                    email: { $first: '$email' },
                    username: { $first: '$username' },
                    photo: { $first: '$photo' },
                    bio: { $first: '$bio' },
                    followers: { $first: '$followers' },
                    followings: { $first: '$followings' },
                    createdAt: { $first: '$createdAt' },
                    updatedAt: { $first: '$updatedAt' },
                    posts: { $push: '$userPosts' }
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    email: 1,
                    username: 1,
                    photo: 1,
                    bio: 1,
                    followers: 1,
                    followings: 1,
                    posts: { $ifNull: ['$posts', []] } // Handle potential null values
                }
            }
        ];
        const check = await this.UserModel.aggregate(pipeline).exec()

        if (!check[0]) {
            throw new NotFoundException(`No user found`)
        }
        return check[0];
    }
}
