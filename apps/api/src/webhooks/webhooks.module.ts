import { Module } from "@nestjs/common";
import { WebhooksController } from "./webhooks.controller";
import { WebhooksService } from "./webhooks.service";
import { StorageModule } from "../storage/storage.module";
import { AiConnectorsModule } from "../ai-connectors/ai-connectors.module";

@Module({
  imports: [StorageModule, AiConnectorsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
})
export class WebhooksModule {}
