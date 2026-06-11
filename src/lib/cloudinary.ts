import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  folder: string,
  options?: {
    resourceType?: "image" | "video" | "raw"
    publicId?: string
    transformation?: Record<string, unknown>[]
  }
): Promise<{ url: string; publicId: string; format: string; size: number }> {
  const { resourceType = "auto", publicId, transformation } = options || {}

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `skoolyn/${folder}`,
        resource_type: resourceType,
        public_id: publicId,
        transformation: transformation || undefined,
      },
      (error, result) => {
        if (error || !result) {
          reject(new Error(error?.message || "Upload failed"))
          return
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format || "unknown",
          size: result.bytes || 0,
        })
      }
    )
    uploadStream.end(fileBuffer)
  })
}

export async function deleteFromCloudinary(publicId: string, resourceType?: string) {
  return cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType || "image",
  })
}

export function extractPublicId(url: string): string | null {
  try {
    const parsed = new URL(url)
    const pathParts = parsed.pathname.split("/")
    const uploadIndex = pathParts.indexOf("upload")
    if (uploadIndex === -1) return null
    const parts = pathParts.slice(uploadIndex + 2)
    const publicId = parts.join("/").replace(/\.[^/.]+$/, "")
    return publicId
  } catch {
    return null
  }
}
