"use client"

import { useState, useRef, DragEvent } from "react"

interface ImageUploadProps {
  value: string | string[]
  onChange: (url: string | string[]) => void
  multiple?: boolean
  label?: string
}

export default function ImageUpload({ value, onChange, multiple = false, label }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [dragging, setDragging] = useState(false)

  const urls = multiple ? (value as string[]) : (value ? [value as string] : [])

  async function uploadFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Yalnızca resim dosyaları yüklenebilir.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Dosya boyutu 5MB'dan büyük olamaz.")
      return
    }

    setUploading(true)
    setError("")

    const formData = new FormData()
    formData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Yükleme başarısız.")
        return
      }

      if (multiple) {
        onChange([...(value as string[]), data.url])
      } else {
        onChange(data.url)
      }
    } catch {
      setError("Dosya yüklenirken bir hata oluştu.")
    } finally {
      setUploading(false)
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files) return
    for (const file of Array.from(files)) {
      uploadFile(file)
    }
    e.target.value = ""
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    const files = e.dataTransfer.files
    if (!files) return
    for (const file of Array.from(files)) {
      uploadFile(file)
    }
  }

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(true)
  }

  function handleDragLeave() {
    setDragging(false)
  }

  function removeUrl(url: string) {
    if (multiple) {
      onChange((value as string[]).filter((u) => u !== url))
    } else {
      onChange("")
    }
  }

  function handleZoneClick() {
    inputRef.current?.click()
  }

  const zoneContent = (
    <>
      <svg className="w-8 h-8 text-stone-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <p className="text-sm text-stone-500">{uploading ? "Yükleniyor..." : "Tıkla veya sürükle & bırak"}</p>
      <p className="text-xs text-stone-400 mt-1">JPG, PNG, GIF, WebP, SVG (max 5MB)</p>
    </>
  )

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-stone-700">{label}</label>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        multiple={multiple}
        onChange={handleFileInput}
        className="hidden"
      />

      {error && (
        <p className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded">{error}</p>
      )}

      {!multiple && urls.length > 0 ? (
        <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-stone-300 bg-stone-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={urls[0]} alt="" className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => removeUrl(urls[0])}
            className="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
          >
            ✕
          </button>
          <button
            type="button"
            onClick={handleZoneClick}
            className="absolute bottom-1 right-1 w-6 h-6 bg-stone-800 text-white rounded-full flex items-center justify-center text-xs hover:bg-stone-700 transition-colors"
          >
            ↻
          </button>
        </div>
      ) : null}

      {(!multiple || urls.length === 0) && !(uploading && !multiple && urls.length > 0) ? (
        <div
          onClick={handleZoneClick}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${
            dragging
              ? "border-stone-600 bg-stone-100"
              : "border-stone-300 hover:border-stone-400 hover:bg-stone-50"
          }`}
        >
          {uploading ? (
            <svg className="w-8 h-8 text-stone-400 animate-spin mb-2" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : null}
          {!uploading && zoneContent}
          {uploading && <p className="text-sm text-stone-500">Yükleniyor...</p>}
        </div>
      ) : null}

      {multiple && urls.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {urls.map((url, i) => (
            <div key={i} className="relative w-full aspect-square rounded-lg overflow-hidden border border-stone-300 bg-stone-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeUrl(url)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-700 transition-colors"
              >
                ✕
              </button>
            </div>
          ))}
          {uploading ? (
            <div className="flex items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed border-stone-300 bg-stone-50">
              <svg className="w-6 h-6 text-stone-400 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : (
            <div
              onClick={handleZoneClick}
              className="flex items-center justify-center w-full aspect-square rounded-lg border-2 border-dashed border-stone-300 bg-stone-50 cursor-pointer hover:border-stone-400 hover:bg-stone-100 transition-colors"
            >
              <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
