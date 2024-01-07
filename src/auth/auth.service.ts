import { HttpException, HttpStatus, Injectable, NotAcceptableException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/model/users.model';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<User>,
        private readonly jwtServie: JwtService,
        private readonly userService: UserService) { }

    async registerUser(data: CreateUserDto): Promise<object | null> {
        return await this.userService.registerUser(data)
    }


    async validateUser(data: LoginDto): Promise<object | null> {
        const { username, password } = data;
        let user = await this.userModel.findOne({ username: username })
        if (!user) {
            // throw new NotFoundException(`No user found with ${username} username`)
            throw new HttpException(`No user found with ${username} username`, HttpStatus.OK);
        }
        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
            throw new UnauthorizedException('Password creditionals are not valid');
        }
        const payload = { username, _id: user._id, email: user.email }
        const token = this.jwtServie.sign(payload, { expiresIn: '24h' })

        if (user && passwordValid && token) {
            delete user.password;
            return {
                access_token: token,
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email
            };
        }
        return null;
    }


    async AddAdditionalInfo(data) {
        let { photo, dob, mobile, bio, id } = data;
        // console.log(data);
        try {
            id=new Types.ObjectId(id)
        } catch (error) {
            throw new UnprocessableEntityException(`Invalid User ID`)
        }
        const result = await this.userModel.findByIdAndUpdate(id, { photo, dob, mobile, bio }, { new: true }).exec()
        if (!result) {
            throw new NotFoundException(`No user found with the given id`)
        }
        return true;
    }
    
}
