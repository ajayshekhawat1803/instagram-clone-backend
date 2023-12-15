import { Body, Controller, Post, Req } from '@nestjs/common';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    async login(@Body() data: LoginDto,@Req() req) {
        try {
            const result = await this.authService.validateUser(data)
            if (result) {
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
            req.res.status(error.status)
            return {
                data: null,
                message: `${error.message}`
            }
        }
    }

    @Post('signup')
    async signup(@Body() data: CreateUserDto,@Req() req) {
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
            req.res.status(error.status)
            return {
                data: null,
                message: `${error.message}`
            }
        }
    }
}
