import { Body, Controller, Post } from '@nestjs/common';
import { UserService } from './users.service';

@Controller('user')
export class UserController {
    constructor(
        private readonly userServices: UserService
    ) { }

}
