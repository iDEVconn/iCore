import { useMutation } from "@tanstack/react-query";
import { api } from "@/api/client";
import type { AiParseResult } from "@starter/shared";

export function useParseDocument() {
  return useMutation({
    mutationFn: async ({
      file,
      skill,
    }: {
      file: File;
      skill?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (skill) formData.append("skill", skill);
      return api<AiParseResult[]>("/ai-connectors/parse", {
        method: "POST",
        body: formData,
      });
    },
  });
}

export function useUploadDocument() {
  return useMutation({
    mutationFn: async ({
      file,
      skill,
      bucket,
    }: {
      file: File;
      skill?: string;
      bucket?: string;
    }) => {
      const formData = new FormData();
      formData.append("file", file);
      if (skill) formData.append("skill", skill);
      if (bucket) formData.append("bucket", bucket);
      return api<{
        url: string;
        userId: string;
        results: AiParseResult[];
        count: number;
      }>("/ai-connectors/upload", {
        method: "POST",
        body: formData,
      });
    },
  });
}
