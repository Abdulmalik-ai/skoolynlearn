import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads")

export function getUploadDir(subfolder: string) {
  const dir = path.join(UPLOAD_DIR, subfolder)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  return dir
}

export async function saveUploadFile(
  file: File,
  subfolder: string
): Promise<{ filePath: string; url: string; originalName: string; size: number; mimeType: string }> {
  const dir = getUploadDir(subfolder)
  const ext = path.extname(file.name) || ".bin"
  const filename = `${uuidv4()}${ext}`
  const filePath = path.join(dir, filename)
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  fs.writeFileSync(filePath, buffer)

  return {
    filePath: path.join("uploads", subfolder, filename).replace(/\\/g, "/"),
    url: `/uploads/${subfolder}/${filename}`,
    originalName: file.name,
    size: file.size,
    mimeType: file.type,
  }
}

export async function saveBufferFile(
  buffer: Buffer,
  originalName: string,
  subfolder: string
): Promise<{ filePath: string; url: string; originalName: string; size: number }> {
  const dir = getUploadDir(subfolder)
  const ext = path.extname(originalName) || ".bin"
  const filename = `${uuidv4()}${ext}`
  const filePath = path.join(dir, filename)
  fs.writeFileSync(filePath, buffer)

  return {
    filePath: path.join("uploads", subfolder, filename).replace(/\\/g, "/"),
    url: `/uploads/${subfolder}/${filename}`,
    originalName,
    size: buffer.length,
  }
}

export function deleteUploadFile(filePath: string) {
  try {
    const fullPath = path.join(process.cwd(), "public", filePath)
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
  } catch (e) {
    console.error("Failed to delete file", e)
  }
}
