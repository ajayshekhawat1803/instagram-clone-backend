import { Body, Controller, Param, Post, Req, UnprocessableEntityException, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { AddDetailsDto, CreateUserDto, LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';
import { AWSConfigsS3 } from 'src/s-3/s3-config';

@Controller('auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly AWSs3Manager: AWSConfigsS3
    ) { }

    @Post('login')
    async login(@Body() data: LoginDto, @Req() req) {
        try {
            const result = await this.authService.validateUser(data)
            if (result) {
                req.res.status(200)
                return {
                    data: result,
                    message: `Successful login`
                }
            } else {
                return {
                    data: null,
                    message: `something went wrong`
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

    @Post('signup')
    async signup(@Body() data: CreateUserDto, @Req() req) {
        try {
            if (data.username.split(" ").length>1) {
                throw new UnprocessableEntityException("username can'nt contain spaces")
            }
            const result = await this.authService.registerUser(data)
            if (result) {
                return {
                    data: result,
                    message: `successfull registeration`
                }
            } else {
                return {
                    data: null,
                    message: `something went wrong`
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

    @Post('signup/add-details/:id')
    @UseInterceptors(FilesInterceptor('photo', 1, {
        limits: {
            fileSize: 1024 * 1024 * 5, // set a file size limit (in bytes) - here, 5MB
        },
        fileFilter: (req, file, callback) => {
            // implement custom file filtering logic if needed
            const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
            if (allowedMimes.includes(file.mimetype)) {
                callback(null, true);
            } else {
                callback(new Error('Invalid file type'), false);
            }
        },
    }))
    async addAdditionalDetails(@Body() data: AddDetailsDto, @Req() req, @UploadedFiles() photo, @Param('id') id) {
        try {
            photo = await this.AWSs3Manager.addMultipleFiles(photo)
            const result = await this.authService.AddAdditionalInfo({ ...data, photo: photo[0]?.key || "", id })
            if (result) {
                return {
                    data: result,
                    message: `successfully Added Details`
                }
            } else {
                return {
                    data: null,
                    message: `something went wrong`
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
