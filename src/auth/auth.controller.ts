import { Body, Controller, Param, Post, Req, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AddDetailsDto, CreateUserDto, LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';
import { FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { diskStorage } from 'multer';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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
    @UseInterceptors(FileInterceptor('photo', {
        storage: diskStorage({
            destination: (req, file, callback) => {
                const userId = req.params?.id;
                if (userId) {
                    const destination = `./uploads/${userId}/${file.fieldname}`;
                    if (!fs.existsSync(destination)) {
                        fs.mkdirSync(destination, { recursive: true });
                    }
                    callback(null, destination);
                } else {
                    callback(new Error('User ID missing'), null);
                }
            },
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const extension = file.originalname.split('.').pop(); // get the file extension
                const filename = `${uniqueSuffix}.${extension}`;
                callback(null, filename);
            },
        }),
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
    async addAdditionalDetails(@Body() data: AddDetailsDto, @Req() req, @UploadedFile() photo, @Param('id') id) {
        try {
            const result = await this.authService.AddAdditionalInfo({ ...data, photo:photo?.filename, id })
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
