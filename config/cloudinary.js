import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { Readable } from "stream";
import { currentEnv } from "./mongooseConfig.js";

class CloudinaryService {
  constructor() {
    dotenv.config();
    const requiredEnvVars = ["CLOUD_NAME", "CLOUD_KEY", "CLOUD_SECRET"];
    this.validateEnvironmentVariables(requiredEnvVars);

    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.CLOUD_KEY,
      api_secret: process.env.CLOUD_SECRET,
    });

    // Determine the base folder based on environment
    this.baseFolder = currentEnv.includes("localhost") ? "localhost" : "att";
  }

  validateEnvironmentVariables(required) {
    const missing = required.filter((var_name) => !process.env[var_name]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variables: ${missing.join(", ")}`
      );
    }
  }

  async uploadDocument(input, id, fileName) {
    try {
      const fileExtension = fileName.split(".").pop().toLowerCase();
      const subFolder = fileExtension === "docx" ? "docx" : "files";
      const folder = `${this.baseFolder}/${subFolder}`;

      // Ensure unique file uploads to prevent overwriting
      const timestamp = Date.now();
      const publicId = `${folder}/${id}-${timestamp}`; // Appending timestamp for uniqueness

      const uploadOptions = {
        resource_type: "auto",
        public_id: publicId,
        overwrite: true,
        filename_override: fileName,
        use_filename: true,
      };

      let response;

      if (Buffer.isBuffer(input)) {
        // Handle buffer input with stream
        const stream = Readable.from(input);
        response = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            uploadOptions,
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.pipe(uploadStream);
        });
      } else if (typeof input === "string") {
        // Handle file path upload
        response = await cloudinary.uploader.upload(input, uploadOptions);
      } else {
        throw new Error("Invalid input: must be a file path or buffer.");
      }

      return {
        url: response.secure_url,
        publicId: response.public_id,
        format: response.format,
        size: response.bytes,
        createdAt: response.created_at,
        fullPath: `${response.public_id}.${response.format}`,
        resourceType: response.resource_type,
      };
    } catch (error) {
      console.error("Upload error:", error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  async deleteDocument(publicId, resourceType) {
    if (!publicId) {
      throw new Error("Public ID is required");
    }
    if (!resourceType) {
      throw new Error("ResourceType is required to delete!");
    }

    try {
      // Try to determine resource type if not provided
      if (resourceType === "auto") {
        // For files in our folders, they're likely "raw"
        const baseFilesFolderPattern = new RegExp(
          `^(${this.baseFolder}/(files|docx))/`
        );
        if (baseFilesFolderPattern.test(publicId)) {
          resourceType = "raw";
        } else {
          // Try to get info about the resource to determine its type
          try {
            const info = await this.getDocumentInfo(publicId, "image");
            resourceType = "image";
          } catch (e) {
            try {
              const info = await this.getDocumentInfo(publicId, "raw");
              resourceType = "raw";
            } catch (e2) {
              try {
                const info = await this.getDocumentInfo(publicId, "video");
                resourceType = "video";
              } catch (e3) {
                throw new Error(
                  "Could not determine resource type for deletion"
                );
              }
            }
          }
        }
      }

      console.log(`Deleting ${publicId} as resource type: ${resourceType}`);

      const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        invalidate: true,
      });

      if (response.result !== "ok") {
        throw new Error(`Deletion failed: ${response.result}`);
      }

      return {
        success: true,
        publicId,
        result: response.result,
        resourceType,
      };
    } catch (error) {
      console.error("Delete error:", error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  extractPublicId(cloudinaryUrl) {
    if (!cloudinaryUrl || typeof cloudinaryUrl !== "string") {
      throw new Error("Valid Cloudinary URL is required");
    }

    try {
      // This regex might not handle all Cloudinary URL formats
      // A more robust approach is to use Cloudinary's native utils
      const urlPattern = /\/v\d+\/(.+?)(?:\.\w+)?$/;
      const match = cloudinaryUrl.match(urlPattern);

      if (!match) {
        throw new Error("Invalid Cloudinary URL format");
      }

      return match[1];
    } catch (error) {
      throw new Error(`Failed to extract public ID: ${error.message}`);
    }
  }

  async getDocumentInfo(publicId, resourceType = "auto") {
    if (!publicId) {
      throw new Error("Public ID is required");
    }

    // If auto, try different resource types
    if (resourceType === "auto") {
      const types = ["raw", "image", "video"];
      let lastError = null;

      for (const type of types) {
        try {
          const result = await this.getDocumentInfo(publicId, type);
          return result;
        } catch (error) {
          lastError = error;
          // Continue to next type
        }
      }

      // If we got here, all types failed
      throw lastError || new Error("Could not find resource with any type");
    }

    try {
      const result = await cloudinary.api.resource(publicId, {
        resource_type: resourceType,
      });

      return {
        publicId: result.public_id,
        url: result.secure_url,
        format: result.format,
        size: result.bytes,
        createdAt: result.created_at,
        tags: result.tags,
        resourceType: resourceType,
      };
    } catch (error) {
      throw new Error(
        `Failed to get document info (${resourceType}): ${error.message}`
      );
    }
  }
}

// Export singleton instance
export const cloudinaryService = new CloudinaryService();

// Also export class for testing or multiple instances
export { CloudinaryService };
