import { Injectable, NotAcceptableException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from 'src/users/model/users.model';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/users/users.service';

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
            throw new NotFoundException(`No user found with ${username} username`)
        }
        const passwordValid = await bcrypt.compare(password, user.password)
        if (!passwordValid) {
            throw new UnauthorizedException('Password creditionals are not valid');
        }
        const payload = { user }
        const token = this.jwtServie.sign(payload, { expiresIn: '5h' })

        if (user && passwordValid && token) {
            delete user.password;
            return {
                access_token: token,
                user
            };
        }
        return null;
    }
}
