import { Body, Controller, ForbiddenException, Get, HttpStatus, Post, Query, Req, UnprocessableEntityException } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { AddCommentDto } from './dto/comments.dto';
import { Types } from 'mongoose';

@Controller('comments')
export class CommentsController {
    constructor(private readonly commentsService: CommentsService) { }

    @Post('add')
    async addComment(@Req() req, @Body() data: AddCommentDto) {
        try {
            const { postId, postOwnerId, comment } = data;
            const selfUserId = req.user?._id
            if (!selfUserId) {
                throw new ForbiddenException(`Unauthenticated way !!!`)
            }
            const result = await this.commentsService.addComment(selfUserId, postId, postOwnerId, comment)
            if (result) {
                return {
                    data: result,
                    message: `Comment Added`
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

    @Get()
    async getComments(@Req() req, @Query() data) {
        try {
            let { postId, postOwnerId } = data;
            try {
                postId = new Types.ObjectId(postId)
            } catch (error) {
                throw new UnprocessableEntityException(`Invalid post Id`)
            }
            try {
                postOwnerId = new Types.ObjectId(postOwnerId)
            } catch (error) {
                throw new UnprocessableEntityException(`Invalid Post Owner Id Id`)
            }

            const result = await this.commentsService.getComments(postId, postOwnerId)
            if (result) {
                return {
                    data: result,
                    message: `All Comments`
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
