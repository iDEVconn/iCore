import { Injectable, BadRequestException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AiParseResult, AiSkillConfig } from "@starter/shared";

const DEFAULT_SKILL: AiSkillConfig = {
  name: "document",
  prompt: `You are a document parser. Extract structured data from this document (PDF or image).
Return a JSON array of objects. Each object represents one logical item found in the document.
Each object must have a "fields" key containing key-value pairs of extracted data.
Common fields: title, date, amount, currency, from, to, description, line_items, category.
Use null for missing data. Even if there is only one item, return it inside an array.
Return ONLY the JSON array, no explanations or markdown.`,
  expectedFields: [
    "title",
    "date",
    "amount",
    "currency",
    "from",
    "to",
    "description",
  ],
};

@Injectable()
export class AiConnectorsService {
  private genAI: GoogleGenerativeAI;
  private skills = new Map<string, AiSkillConfig>();

  constructor(private config: ConfigService) {
    this.genAI = new GoogleGenerativeAI(
      this.config.getOrThrow("GEMINI_API_KEY"),
    );
    this.registerSkill(DEFAULT_SKILL);
  }

  /** Register a custom AI parsing skill. */
  registerSkill(skill: AiSkillConfig) {
    this.skills.set(skill.name, skill);
  }

  /** List all registered skill names. */
  listSkills(): { name: string; expectedFields?: string[] }[] {
    return [...this.skills.values()].map((s) => ({
      name: s.name,
      expectedFields: s.expectedFields,
    }));
  }

  /** Parse a file using a named skill (defaults to "document"). */
  async parse(
    file: Express.Multer.File,
    skillName = "document",
  ): Promise<AiParseResult[]> {
    if (!file) throw new BadRequestException("No file provided");

    const skill = this.skills.get(skillName);
    if (!skill)
      throw new BadRequestException(`Unknown skill: ${skillName}`);

    const modelName = this.config.get("GEMINI_MODEL") || "gemini-2.0-flash";
    const model = this.genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent([
      { text: skill.prompt },
      {
        inlineData: {
          mimeType: file.mimetype,
          data: file.buffer.toString("base64"),
        },
      },
    ]);

    const raw = result.response.text();
    return this.parseResponse(raw, skill.expectedFields);
  }

  private parseResponse(
    raw: string,
    expectedFields?: string[],
  ): AiParseResult[] {
    const empty: AiParseResult = { fields: {}, confidence: 0, raw };

    let items: Record<string, unknown>[];
    try {
      const cleaned = raw
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      const parsed = JSON.parse(cleaned);
      items = Array.isArray(parsed) ? parsed : [parsed];
    } catch {
      return [empty];
    }

    return items.map((item) => {
      const fields: Record<string, string | number | boolean | null> =
        item.fields && typeof item.fields === "object"
          ? (item.fields as Record<string, string | number | boolean | null>)
          : this.extractFields(item);

      const totalExpected = expectedFields?.length || Object.keys(fields).length || 1;
      const filledCount = Object.values(fields).filter(
        (v) => v !== null && v !== undefined && v !== "",
      ).length;

      return {
        fields,
        confidence: Math.min(filledCount / totalExpected, 1),
        raw,
      };
    });
  }

  /** Flatten a raw object into a fields record (fallback when model doesn't wrap in "fields"). */
  private extractFields(
    obj: Record<string, unknown>,
  ): Record<string, string | number | boolean | null> {
    const fields: Record<string, string | number | boolean | null> = {};
    for (const [key, val] of Object.entries(obj)) {
      if (
        typeof val === "string" ||
        typeof val === "number" ||
        typeof val === "boolean" ||
        val === null
      ) {
        fields[key] = val;
      }
    }
    return fields;
  }
}
