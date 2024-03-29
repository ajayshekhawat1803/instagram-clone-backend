import { Body, Controller, Get, HttpStatus, NotFoundException, Param, Post, Req, UnprocessableEntityException, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreatePostDto } from "./dto/posts.dto";
import { multerConfig } from "src/multer/multer.config";
import { InjectModel } from "@nestjs/mongoose";
import { User } from "src/users/model/users.model";
import { Model, Types } from "mongoose";
import { AWSConfigsS3 } from "src/s-3/s3-config";


@Controller('posts')
export class PostsController {

  constructor(
    private readonly PostsService: PostsService,
    @InjectModel(User.name) private readonly userModel: Model<User>,
    private readonly AWSs3Manager: AWSConfigsS3) {
  }

  @Post('create')
  @UseInterceptors(FilesInterceptor('posts', 1))
  async creaePost(@Req() req, @Body() data: CreatePostDto, @UploadedFiles() files) {
    try {

      if (files?.length < 1) {
        req.res.status(422)
        return {
          data: null,
          message: `Upload at least 1 image`
        }
      }
      const UploadedFiles = await this.AWSs3Manager.addMultipleFiles(files)
      const result = await this.PostsService.createPost(req?.user?._id, data, UploadedFiles)
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
      const posts = await this.PostsService.getAllPostsByUserID(checkUserExistence._id)
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

  @Get('post/:postId')
  async getPostByID(@Param('postId') postId, @Req() req) {
    try {
      try {
        new Types.ObjectId(postId)
      } catch (error) {
        throw new UnprocessableEntityException('Invalid Post Id')
      }
      const posts = await this.PostsService.getPostByPostID(postId)
      if (posts) {
        return {
          data: posts,
          message: `Successfully fetched  posts`
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