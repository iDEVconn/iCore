import { BadRequestException, Injectable } from "@nestjs/common";
import { SupabaseService } from "../supabase/supabase.service";
import { randomUUID } from "crypto";

const PRIVATE_BUCKETS = new Set(["documents"]);

@Injectable()
export class StorageService {
  constructor(private supabase: SupabaseService) {}

  async upload(file: Express.Multer.File, bucket: string) {
    const ext = file.originalname.split(".").pop() ?? "bin";
    const filePath = `${randomUUID()}.${ext}`;

    const { error } = await this.supabase.admin.storage
      .from(bucket)
      .upload(filePath, file.buffer, { contentType: file.mimetype });

    if (error) throw new BadRequestException(error.message);

    if (PRIVATE_BUCKETS.has(bucket)) {
      return { url: `storage://${bucket}/${filePath}` };
    }

    const {
      data: { publicUrl },
    } = this.supabase.admin.storage.from(bucket).getPublicUrl(filePath);
    return { url: publicUrl };
  }

  async getSignedUrl(path: string): Promise<string> {
    const uri = path.startsWith("storage://") ? path.slice(10) : path;
    const sep = uri.indexOf("/");
    const bucket = uri.slice(0, sep);
    const filePath = uri.slice(sep + 1);

    const { data, error } = await this.supabase.admin.storage
      .from(bucket)
      .createSignedUrl(filePath, 3600);
    if (error || !data?.signedUrl)
      throw new BadRequestException("Cannot generate signed URL");
    return data.signedUrl;
  }

  async removeByUrl(url: string) {
    let bucket: string;
    let filePath: string;

    if (url.startsWith("storage://")) {
      const uri = url.slice(10);
      const sep = uri.indexOf("/");
      bucket = uri.slice(0, sep);
      filePath = uri.slice(sep + 1);
    } else {
      const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
      if (!match) return;
      [, bucket, filePath] = match;
    }

    await this.supabase.admin.storage.from(bucket).remove([filePath]);
  }
}
