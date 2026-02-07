import type { Request, Response } from "express";
import { UploadImageRequest, FileSchema } from "../schemas/files.schema";
import { uploadToS3 } from "../services/s3.services";
import { prisma } from "../config/db.config";
import { v4 as uuidv4 } from "uuid";
import { AdminAuthSchema } from "../schemas/admin.schema";

export const uploadImage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const fileResult = FileSchema.safeParse(req.file);
    if (!fileResult.success) {
      res.status(400).json({ error: fileResult.error.format() });
      return;
    }

    const authResult = req.auth!;

    const bodyResult = UploadImageRequest.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.flatten() });
      return;
    }

    const { shopId } = authResult;
    const { collection } = bodyResult.data;

    const shop = await prisma.shop.findUnique({
      where: { shopId },
    });

    if (!shop) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const safeName = req.file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9.-]/g, "")
      .toLowerCase();

    const existingLog = await prisma.uploadLog.findFirst({
      where: {
        shopId,
        collection,
        filename: safeName,
      },
    });

    if (existingLog) {
      res.status(200).json({
        error: "This file has already been uploaded",
        url: existingLog.url,
        collection: existingLog.collection,
      });
      return;
    }

    const buffer = req.file.buffer;
    const s3Url = await uploadToS3(buffer, safeName, shopId, collection);

    if (!s3Url) {
      res.status(500).json({ error: "Failed to upload image to S3" });
      return;
    }

    const uploadLog = await prisma.$transaction(async (tx) => {
      const counter = await tx.shopCounter.update({
        where: { shopId },
        data: { uploadLogCounter: { increment: 1 } },
      });

      const log = await tx.uploadLog.create({
        data: {
          uid: uuidv4(),
          shopId,
          collection,
          shopScopedId: counter.uploadLogCounter,
          filename: safeName,
          url: s3Url,
          mimetype: req.file?.mimetype || "application/octet-stream",
          size: req.file?.size || 0,
        },
      });

      return log;
    });

    res.status(200).json({
      message: "Image uploaded successfully",
      url: uploadLog.url,
      collection: uploadLog.collection,
    });
  } catch (err: any) {
    console.error("Upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const uploadMultipleImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({ error: "No files uploaded" });
      return;
    }

    const files = Array.isArray(req.files) ? req.files : [];

    const authResult = req.auth!;
    const bodyResult = UploadImageRequest.safeParse(req.body);
    if (!bodyResult.success) {
      res.status(400).json({ error: bodyResult.error.flatten() });
      return;
    }

    const { shopId } = authResult;
    const { collection } = bodyResult.data;

    const shop = await prisma.shop.findUnique({
      where: { shopId },
    });

    if (!shop) {
      res.status(404).json({ error: "Store not found" });
      return;
    }

    const uploadResults = [];
    const errors = [];

    for (const file of files) {
      try {
        const safeName = file.originalname
          .replace(/\s+/g, "-")
          .replace(/[^a-zA-Z0-9.-]/g, "")
          .toLowerCase();

        const existingLog = await prisma.uploadLog.findFirst({
          where: {
            shopId,
            collection,
            filename: safeName,
          },
        });

        if (existingLog) {
          uploadResults.push({
            filename: file.originalname,
            url: existingLog.url,
            collection: existingLog.collection,
            status: "already_exists",
          });
          continue;
        }

        const buffer = file.buffer;
        const s3Url = await uploadToS3(buffer, safeName, shopId, collection);

        if (!s3Url) {
          errors.push({
            filename: file.originalname,
            error: "Failed to upload to S3",
          });
          continue;
        }

        const uploadLog = await prisma.$transaction(async (tx) => {
          const counter = await tx.shopCounter.update({
            where: { shopId },
            data: { uploadLogCounter: { increment: 1 } },
          });

          const log = await tx.uploadLog.create({
            data: {
              uid: uuidv4(),
              shopId,
              collection,
              shopScopedId: counter.uploadLogCounter,
              filename: safeName,
              url: s3Url,
              mimetype: file.mimetype || "application/octet-stream",
              size: file.size || 0,
            },
          });

          return log;
        });

        uploadResults.push({
          filename: file.originalname,
          url: uploadLog.url,
          collection: uploadLog.collection,
          status: "success",
        });
      } catch (err: any) {
        errors.push({
          filename: file.originalname,
          error: err.message,
        });
      }
    }

    res.status(200).json({
      message: "Batch upload completed",
      successful: uploadResults.filter((r) => r.status === "success").length,
      total: files.length,
      uploads: uploadResults,
      ...(errors.length > 0 && { errors }),
    });
  } catch (err: any) {
    console.error("Batch upload error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getPreviousImages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const authParsed = AdminAuthSchema.safeParse(req.auth);
  if (!authParsed.success) {
    res.status(400).json({ error: authParsed.error.flatten() });
    return;
  }

  const queryParsed = UploadImageRequest.safeParse(req.query);
  if (!queryParsed.success) {
    res.status(400).json({ error: queryParsed.error.flatten() });
    return;
  }

  const { shopId } = authParsed.data;
  const { collection } = queryParsed.data;

  try {
    const images = await prisma.uploadLog.findMany({
      where: { shopId, collection },
      orderBy: { timestamp: "desc" },
    });

    res.status(200).json({ images });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
