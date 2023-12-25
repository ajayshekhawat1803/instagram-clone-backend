import { Body, Controller, Get, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { followingsService } from "./followingsservice";
import { RemoveFollowerDto } from "./dto/followings.dto";

@Controller('followings')
export class followingsController {
    constructor(private readonly followersService: followingsService) { }
    

    @Get('/:id')
    async getFollowings(@Req() req, @Param('id') id) {
        try {
            const result = await this.followersService.getFollowings(id)
            if (result) {
                req.res.status(HttpStatus.OK)
                return {
                    data: result,
                    message: `All Followings Fetched`
                }
            }
            else {
                req.res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                return {
                    data: null,
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