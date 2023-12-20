import { Body, Controller, Post, Req, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { PostsService } from "./posts.service";
import { FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from 'multer';
import { CreatePostDto } from "./dto/posts.dto";
import * as fs from 'fs';


@Controller('posts')
export class PostsController {

  constructor(private readonly PostsService: PostsService) {
  }

  @Post('create')
  @UseInterceptors(FilesInterceptor('posts', 5, {
    storage: diskStorage({
      destination: (req, file, callback) => {
        const userId = req.user.user?._id;
        if (userId) {
          const destination = `./uploads/${userId}/${file.fieldname}`;
          if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
          }
          callback(null, destination);
        } else {
          callback(new Error('User not authenticated or missing ID'), null);
        }
      },
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const extension = file.originalname.split('.').pop(); // get the file extension
        const filename = `${uniqueSuffix}.${extension}`;
        callback(null, filename);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * 5, // set a file size limit (in bytes) - here, 5MB
    },
    fileFilter: (req, file, callback) => {
      // implement custom file filtering logic if needed
      const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedMimes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(new Error('Invalid file type'), false);
      }
    },
  }))
  async creaePost(@Req() req, @Body() data: CreatePostDto, @UploadedFiles() files) {
    console.log(files);
    return this.PostsService.createPost(req?.user?.user?._id, data, files)
  }
}