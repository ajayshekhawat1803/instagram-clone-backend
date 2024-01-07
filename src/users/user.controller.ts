import { Body, Controller, Get, HttpStatus, Param, Patch, Post, Req, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/users.dto';
import { Types } from 'mongoose';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { multerConfig } from 'src/multer/multer.config';

@Controller('user')
export class UserController {
    constructor(
        private readonly userServices: UserService
    ) { }


    @Patch('edit')
    @UseInterceptors(FileInterceptor('photo', multerConfig))
    async editUser(@Body() data: UpdateUserDto, @Req() req, @UploadedFile() file) {
        try {
            if (file) {
                data.photo = file.filename
            }
            const userID = req.user._id
            if (!userID) {
                throw new UnauthorizedException('Not authorised for this action')
            }
            const result = await this.userServices.editUser(data, userID, req)
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

    @Get('getuser-for-edit')
    async getUserForEdit(@Req() req) {
        try {
            const userID = req.user._id
            if (!userID) {
                throw new UnauthorizedException('Not authorised for this action')
            }
            const result = await this.userServices.getUserForEdit(userID)
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
    @Get('get-for-notification/:id')
    async getUserForNotifications(@Param('id') id, @Req() req) {
        try {
            const result = await this.userServices.getUserByIDForNotifications(id)
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

    @Get('get-all-users')
    async getAllUsers(@Req() req) {
        try {
            const result = await this.userServices.getAllUsers()
            if (result.length > 0) {
                return {
                    data: result,
                    message: `Fetched all users Details`
                }
            }
            if (result.length === 0) {
                return {
                    data: result,
                    message: `No Users`
                }
            }
            else {
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
