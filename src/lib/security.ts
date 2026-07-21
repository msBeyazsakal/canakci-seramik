const ALLOWED_EXTENSIONS = [".pdf", ".jpg", ".jpeg", ".png", ".webp"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  pdf: [new Uint8Array([0x25, 0x50, 0x44, 0x46])],
  jpg: [new Uint8Array([0xff, 0xd8, 0xff])],
  jpeg: [new Uint8Array([0xff, 0xd8, 0xff])],
  png: [new Uint8Array([0x89, 0x50, 0x4e, 0x47])],
  webp: [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
}

export function validateFile(file: File): string | null {
  const ext = "." + file.name.split(".").pop()?.toLowerCase()
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return "Yalnızca PDF, JPG, PNG ve WEBP dosyaları kabul edilir."
  }

  if (file.size > MAX_FILE_SIZE) {
    return "Dosya boyutu 10MB'dan büyük olamaz."
  }

  return null
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export function sanitizeText(text: string | null | undefined, maxLength = 1000): string {
  if (!text) return ""
  return escapeHtml(text.trim().slice(0, maxLength))
}
