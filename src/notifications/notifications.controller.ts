import { Controller, ForbiddenException, Get, Req } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User } from "src/users/model/users.model";

@Controller('/notifications')
export class NotificationsController {
    constructor(@InjectModel(User.name) private readonly userModel: Model<User>) { }

    @Get()
    async getNotifications(@Req() req) {
        try {
            const userId = req.user._id;
            if (!userId) {
                throw new ForbiddenException(`Unauthorised way`)
            }
            const data = await this.userModel.findById(userId, { notifications: 1 });
            return {
                data: data.notifications,
                message: `Successfully fetched notifications`
            }
        } catch (error) {
            req.res.status(error.status || 500)
            return {
                data: [],
                message: `${error.message}`
            }
        }
    }
}