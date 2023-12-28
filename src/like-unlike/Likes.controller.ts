import { Body, Controller, ForbiddenException, HttpStatus, Post, Req } from "@nestjs/common";
import { LikesService } from "./Likes.service";
import { LikeUnlikeDto } from "./dto/like-unlike.dto";

@Controller('likes')
export class LikesController {
    constructor(
        private readonly LikesServices: LikesService
    ) { }

    @Post()
    async HandleLike(@Req() req, @Body() data: LikeUnlikeDto) {
        try {
            const { postId, postOwnerId } = data;
            const selfUserId = req.user?._id
            if (!selfUserId) {
                throw new ForbiddenException(`Unauthenticated way !!!`)
            }
            const result = await this.LikesServices.handleLikes(selfUserId, postId, postOwnerId)
            if (result) {
                return {
                    data: result,
                    message: `Post Updated`
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