import { BadRequestException, Injectable, UnauthorizedException, UnprocessableEntityException } from "@nestjs/common";
import { S3 } from "aws-sdk";
import { Types } from "mongoose";
import { extname } from "path";

@Injectable()
export class AWSConfigsS3 {


    async addMultipleFiles(files) {
        const s3 = new S3();
        let uploadedFilesData: Array<any> = []


        const uploadPromises = files.map(async file => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
            const generatedKey = file.fieldname + '/' + file.fieldname + '-' + uniqueSuffix + extname(file.originalname);

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: generatedKey,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            let uploadedfile: Object;
            try {
                uploadedfile = await s3.upload(params).promise();
            } catch (error) {
                console.log("filemanager error -",error);
                
                throw new BadRequestException("Faild to upload file")
            }

            uploadedFilesData.push(uploadedfile)
        });

        await Promise.all(uploadPromises);

        return uploadedFilesData;
    }


    generatePresignedUrl = async (objectKey, expirationTime = 3600) => {
        const params = {
            Bucket: process.env.AWS_BUCKET,
            Key: objectKey,
            Expires: expirationTime,
        };
        const s3 = new S3();

        try {
            const data = await s3.getSignedUrlPromise('getObject', params);
            // await Promise.all(data)
            return data;
        } catch (error) {
            console.error(`Error generating pre-signed URL: ${error}`);
            throw error;
        }
    }


    getAllS3Files = async () => {
        const s3 = new S3();

        const params = {
            Bucket: process.env.AWS_BUCKET,
        };

        try {
            const data = await s3.listObjectsV2(params).promise();
            const files = data.Contents.map((file) => file.Key);
            return files;
        } catch (error) {
            console.error(`Error getting S3 files: ${error}`);
            throw error;
        }
    };
}