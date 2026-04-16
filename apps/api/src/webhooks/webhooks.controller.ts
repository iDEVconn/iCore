import {
  Body,
  Controller,
  Headers,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { WebhooksService } from "./webhooks.service";
import { Public } from "../auth/roles.decorator";

@Controller("webhooks")
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Public()
  @Post("n8n")
  n8n(
    @Headers("x-webhook-secret") secret: string,
    @Body() body: { action: string; data: Record<string, unknown> },
  ) {
    this.webhooksService.verifySecret(secret);
    return this.webhooksService.handleN8n(body.action, body.data);
  }

  @Public()
  @Post("n8n/upload")
  @UseInterceptors(FileInterceptor("file"))
  fileUpload(
    @Headers("x-webhook-secret") secret: string,
    @UploadedFile() file: Express.Multer.File,
    @Body("user_id") userId: string,
    @Body("skill") skill?: string,
  ) {
    this.webhooksService.verifySecret(secret);
    return this.webhooksService.handleFileUpload(file, userId, skill);
  }
}
