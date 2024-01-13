import { Controller, Get, HttpStatus, Query, Req } from "@nestjs/common";
import { AWSConfigsS3 } from "./s3-config";

@Controller('s3-files')
export class FilesController {
    constructor(private readonly AWSConfigsS3: AWSConfigsS3) { }

    @Get()
    async getSecureUrl(@Req() req, @Query('filekey') filekey) {
        try {
            const result = await this.AWSConfigsS3.generatePresignedUrl(filekey)
            if (result) {
                return {
                    data: result,
                    message: `Fetched Secure file`
                }
            }
            else {
                req.res.status(HttpStatus.INTERNAL_SERVER_ERROR)
                return {
                    data: result,
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


