import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { StorageService } from "./storage.service";

@Controller("storage")
export class StorageController {
  constructor(private storageService: StorageService) {}

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body("bucket") bucket: string,
  ) {
    return this.storageService.upload(file, bucket);
  }

  @Get("signed-url")
  async signedUrl(@Query("path") path: string) {
    const url = await this.storageService.getSignedUrl(path);
    return { url };
  }

  @Delete("remove")
  async remove(@Body("url") url: string) {
    await this.storageService.removeByUrl(url);
    return { ok: true };
  }
}
