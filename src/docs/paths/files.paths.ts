import { UploadImageRequest, UploadMultipleImagesRequest } from "../../schemas/files.schema";
import { registry } from "../components/registry";
import { ServerError, Forbidden } from "../responses/common.response";
import { UploadedImageSuccess, ImagesLogs, BatchUploadSuccess } from "../responses/files.response";

// POST /files/image
registry.registerPath({
  method: "post",
  path: "/files/image",
  summary: "Upload an image for a shop",
  description:
    "Allows an authenticated admin to upload an image file (e.g., logo, banner) associated with a specific shop. The file must be sent using multipart/form-data.",
  tags: ["Files"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: {
            type: "object",
            properties: {
              image: {
                type: "string",
                format: "binary",
                description: "The image file to upload (JPEG, PNG, WebP, etc.)",
              },
              collection: {
                type: "string",
                description:
                  "The collection or category under which the image should be shopd (e.g., blogs, users)",
                example: "users",
              },
            },
            required: ["image", "collection"],
          },
        },
      },
    },
  },
  responses: {
    200: UploadedImageSuccess,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "post",
  path: "/files/images",
  summary: "Upload multiple images for a shop",
  description:
    "Allows an authenticated user to upload multiple image files (up to 10) at once. Files must be sent using multipart/form-data.",
  tags: ["Files"],
  security: [{ CookieAuth: [] }],
  request: {
    body: {
      content: {
        "multipart/form-data": {
          schema: UploadMultipleImagesRequest,
        },
      },
    },
  },
  responses: {
    200: BatchUploadSuccess,
    403: Forbidden,
    500: ServerError,
  },
});

registry.registerPath({
  method: "get",
  path: "/files/image/logs",
  summary: "Get previous image upload logs",
  tags: ["Files"],
  security: [{ CookieAuth: [] }],
  request: {
    query: UploadImageRequest,
  },
  responses: {
    200: ImagesLogs,
    403: Forbidden,
    500: ServerError,
  },
});
