import { Controller, Get, Query, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { UserFeed } from "./model/user-feed.model";
import { Model } from "mongoose";
import { UserFeedService } from "./user-feed.service";

@Controller('feed')
export class UserFeedController {
    constructor(
        private readonly UserFeedService: UserFeedService,
        @InjectModel(UserFeed.name) private readonly UserFeedModel: Model<UserFeed>,
    ) { }

    @Get()
    async findAll(@Req() req, @Query('page') page = 1, @Query('pageSize') pageSize = 25) {
        const userId = req.user._id        
        const skip = page === 0 ? 0 : (page - 1) * pageSize;
        const feed = await this.UserFeedService.findAllPaginated( userId,skip, pageSize);
        // const totalLeads = await this.leadService.countLeads(req.headers.slug);
        // const totalPage = Math.ceil(totalLeads / pageSize);
        // return { feed, totalLeads, totalPage, currentPage: page };
        return { ...feed, currentPage: page };
    }
}