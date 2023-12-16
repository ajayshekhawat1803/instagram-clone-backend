import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req } from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';
import { Types } from 'mongoose';

@Controller('user')
export class UserController {
    constructor(
        private readonly userServices: UserService
    ) { }


    @Patch('edit/:id')
    async editUser(@Body() data: UpdateUserDto, @Param('id') id: Types.ObjectId, @Req() req) {
        try {
            const result = await this.userServices.editUser(data, id)
            if (result) {
                return {
                    data: result,
                    message: `Details updated successfully`
                }
            } else {
                req.res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                return {
                    data: result,
                    message: `Something went wrong`
                }
            }
        } catch (error) {
            req.res.status(error.status || 500)
            return {
                data: null,
                message: `${error.message}`
            }
        }
    }

    @Get('get/:id')
    async getUser(@Param('id') id, @Req() req) {
        try {
            const result = await this.userServices.getUserByID(id)
            if (result) {
                return {
                    data: result,
                    message: `Fetched User Details`
                }
            } else {
                req.res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                return {
                    data: result,
                    message: `Something went wrong`
                }
            }
        } catch (error) {
            req.res.status(error.status || 500)
            return {
                data: null,
                message: `${error.message}`
            }
        }
    }

    @Get('username/:username')
    async getUserByUsername(@Param('username') username, @Req() req) {
        try {
            const result = await this.userServices.getUserByUsername(username)
            if (result) {
                return {
                    data: result,
                    message: `Fetched User Details`
                }
            } else {
                req.res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                return {
                    data: result,
                    message: `Something went wrong`
                }
            }
        } catch (error) {
            req.res.status(error.status || 500)
            return {
                data: null,
                message: `${error.message}`
            }
        }
    }
}
