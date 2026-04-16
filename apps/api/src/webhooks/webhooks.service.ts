import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SupabaseService } from "../supabase/supabase.service";
import { StorageService } from "../storage/storage.service";
import { AiConnectorsService } from "../ai-connectors/ai-connectors.service";

@Injectable()
export class WebhooksService {
  constructor(
    private supabase: SupabaseService,
    private config: ConfigService,
    private storage: StorageService,
    private aiConnectors: AiConnectorsService,
  ) {}

  verifySecret(secret: string | undefined) {
    if (secret !== this.config.get("N8N_WEBHOOK_SECRET")) {
      throw new UnauthorizedException("Invalid webhook secret");
    }
  }

  async handleN8n(action: string, data: Record<string, unknown>) {
    if (action === "parse_document") {
      return { ok: true, message: "Use POST /api/webhooks/n8n/upload for file parsing" };
    }

    throw new BadRequestException(`Unknown action: ${action}`);
  }

  async handleFileUpload(
    file: Express.Multer.File,
    userId: string,
    skill?: string,
  ) {
    if (!file) throw new BadRequestException("No file received");

    const { url } = await this.storage.upload(file, "documents");
    const parsed = await this.aiConnectors.parse(file, skill || "document");

    return {
      url,
      userId,
      results: parsed,
      count: parsed.length,
    };
  }
}
