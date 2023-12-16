import { HttpStatus, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { User } from './model/users.model';
import mongoose, { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/auth.dto';
import { UpdateUserDto } from './dto/users.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectModel(User.name)
        private readonly UserModel: Model<User>,
    ) { }

    // Register User
    async registerUser(userData: CreateUserDto): Promise<object | null> {
        const { username, password, name, email } = userData;

        const check = await this.UserModel.find({ $or: [{ username: username }, { email: email }] })
        if (check.length > 0) {
            check.forEach((user) => {
                if (user.email === email) {
                    throw new UnprocessableEntityException(`email already registered`)
                }
                if (user.username === username) {
                    throw new UnprocessableEntityException(`username already taken`)
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
            username
        });
        return result;
    }


    // Update User's details
    async editUser(data: UpdateUserDto, id): Promise<Object | null> {
        try {
            id = new Types.ObjectId(id)
        } catch (error) {
            throw new UnprocessableEntityException(`Provide valid User ID`)
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
            const check = await this.UserModel.find({ $or: [{ username: fieldsTOUpdate['username'] }, { email: fieldsTOUpdate['email'] }] })
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
        const check = await this.UserModel.findById(id)
        if (!check) {
            return null;
        }
        return check;
    }

    async getUserByUsername(username): Promise<Object | null> {
        const check = await this.UserModel.findOne({ username: username })
        if (!check) {
            throw new NotFoundException(`No user found`)
        }
        return check;
    }
}
