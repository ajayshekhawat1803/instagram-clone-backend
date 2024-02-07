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
        let feed = await this.UserFeedService.findAllPaginated( userId,skip, pageSize);
        feed.feed = this.advancedShuffleArray(feed.feed)
        return { ...feed, currentPage: page };
    }


     advancedShuffleArray(array) {
        let currentIndex = array.length;
        while (currentIndex !== 0) {
            
            const randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
        }
        return array;
    }
}