import { Body, Controller, HttpStatus, Post, Req, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { CreatePostDto } from "./dto/posts.dto";
import { multerConfig } from "src/multer/multer.config";


@Controller('posts')
export class PostsController {

  constructor(private readonly PostsService: PostsService) {
  }

  @Post('create')
  @UseInterceptors(FilesInterceptor('posts', 5, multerConfig))
  async creaePost(@Req() req, @Body() data: CreatePostDto, @UploadedFiles() files) {
    // console.log(files);
    try {
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
}