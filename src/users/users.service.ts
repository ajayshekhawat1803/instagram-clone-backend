import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { User } from './model/users.model';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/auth/dto/auth.dto';

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

}
