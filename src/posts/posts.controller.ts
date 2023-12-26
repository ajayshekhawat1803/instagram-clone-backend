import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Req, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreatePostDto } from "./dto/posts.dto";
import { multerConfig } from "src/multer/multer.config";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/users/model/users.model";
import { Model } from "mongoose";


@Controller('posts')
export class PostsController {

  constructor(
    private readonly PostsService: PostsService,
    @InjectModel(User.name) private readonly userModel: Model<User>) {
  }

  @Post('create')
  @UseInterceptors(FilesInterceptor('posts', 5, multerConfig))
  async creaePost(@Req() req, @Body() data: CreatePostDto, @UploadedFiles() files) {
    try {

      if (files?.length < 1) {
        req.res.status(422)
        return {
          data: null,
          message: `Upload at least 1 image`
        }
      }
      const result = await this.PostsService.createPost(req?.user?._id, data, files)
      if (result) {
        return {
          data: result,
          message: `Successfully Posted`
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



  // Method to get all posts of a user
  @Get('/:username')
  async getAllPosts(@Param('username') username, @Req() req) {
    try {
      const checkUserExistence = await this.userModel.findOne({ username: username })
      if (!checkUserExistence) {
        throw new NotFoundException(`No user found with ${username} username`)
      }
      const posts = await this.PostsService.getAllPostsByUsername(username)
      if (posts) {
        return {
          data: posts,
          message: `Successfully fetched all posts`
        }
      }
      else {
        req.res.status(HttpStatus.INTERNAL_SERVER_ERROR)
        return {
          data: [],
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