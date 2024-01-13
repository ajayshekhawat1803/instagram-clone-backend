import { Module } from "@nestjs/common";
import { FilesController } from "./Files.controller";
import { AWSConfigsS3 } from "./s3-config";

@Module({
    imports: [],
    controllers: [FilesController],
    providers: [AWSConfigsS3]
})
export class FilesModule {

}