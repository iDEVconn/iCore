import { Module } from "@nestjs/common";
import { AiConnectorsController } from "./ai-connectors.controller";
import { AiConnectorsService } from "./ai-connectors.service";
import { StorageModule } from "../storage/storage.module";

@Module({
  imports: [StorageModule],
  controllers: [AiConnectorsController],
  providers: [AiConnectorsService],
  exports: [AiConnectorsService],
})
export class AiConnectorsModule {}
