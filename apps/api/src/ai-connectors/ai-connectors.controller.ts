import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ConfigService } from "@nestjs/config";
import { AiConnectorsService } from "./ai-connectors.service";
import { StorageService } from "../storage/storage.service";

@Controller("ai-connectors")
export class AiConnectorsController {
  constructor(
    private aiConnectors: AiConnectorsService,
    private storage: StorageService,
    private config: ConfigService,
  ) {}

  @Post("parse")
  @UseInterceptors(FileInterceptor("file"))
  parse(
    @UploadedFile() file: Express.Multer.File,
    @Body("skill") skill?: string,
  ) {
    return this.aiConnectors.parse(file, skill || "document");
  }

  @Post("upload")
  @UseInterceptors(FileInterceptor("file"))
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: { id: string } },
    @Body("skill") skill?: string,
    @Body("bucket") bucket?: string,
  ) {
    if (!file) throw new BadRequestException("No file provided");

    const targetBucket = bucket || "documents";
    const { url } = await this.storage.upload(file, targetBucket);
    const parsed = await this.aiConnectors.parse(file, skill || "document");

    return {
      url,
      userId: req.user.id,
      results: parsed,
      count: parsed.length,
    };
  }

  @Get("skills")
  listSkills() {
    return this.aiConnectors.listSkills();
  }
}
