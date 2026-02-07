import { z } from "zod";
import { collection } from "../../schemas/files.schema";

export const UploadedImageSuccess = {
  description: "Image uploaded successfully",
  content: {
    "application/json": {
      schema: z.object({
        message: z.string(),
        url: z.string().url(),
        collection,
      }),
    },
  },
};

export const ImagesLogs = {
  description: "Image uploaded successfully",
  content: {
    "application/json": {
      schema: z.object({
        images: z.array(
          z.object({
            id: z.number(),
            shopScopedId: z.number(),
            filename: z.string(),
            mimetype: z.string(),
            collection: z.string(),
            url: z.string().url(),
            timestamp: z.string(),
            size: z.string(),
            uid: z.string(),
          })
        ),
      }),
    },
  },
};

export const BatchUploadSuccess = {
  description: "Batch upload completed",
  content: {
    "application/json": {
      schema: z.object({
        message: z.string(),
        successful: z.number(),
        total: z.number(),
        uploads: z.array(
          z.object({
            filename: z.string(),
            url: z.string().url(),
            collection: z.string(),
            status: z.enum(["success", "already_exists"]),
          })
        ),
        errors: z
          .array(
            z.object({
              filename: z.string(),
              error: z.string(),
            })
          )
          .optional(),
      }),
    },
  },
};
