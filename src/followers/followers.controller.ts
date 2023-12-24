import { Body, Controller, Get, HttpStatus, Param, Post, Req } from "@nestjs/common";
import { followersService } from "./followers.service";
import mongoose from "mongoose";
import { AddNewFollowerDto } from "./dto/followers.dto";

@Controller('followers')
export class followersController {
    constructor(private readonly followersService: followersService) { }

    @Post('/startfollowing')
    async startFollowing(@Req() req, @Body() data: AddNewFollowerDto) {
        try {
            const result = await this.followersService.startFollowing(req, data)
            if (result || result === 0) {
                req.res.status(HttpStatus.OK)
                return {
                    data: result,
                    message: `Started Following`
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


    @Post('/removefollowing')
    async removeFollowing(@Req() req, @Body() data: AddNewFollowerDto) {
        try {
            const result = await this.followersService.RemoveFollowing(req, data)
            if (result || result === 0) {
                req.res.status(HttpStatus.OK)
                return {
                    data: result,
                    message: `Removed Following`
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

    @Get('/:id')
    async getFollowers(@Req() req, @Param('id') id) {
        try {
            const result = await this.followersService.getFollowers(id)
            if (result) {
                req.res.status(HttpStatus.OK)
                return {
                    data: result,
                    message: `All Followers Fetched`
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