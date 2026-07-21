"use client"

import { useEffect, useState } from "react"

interface InstagramMedia {
  id: string
  caption?: string
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM"
  media_url: string
  permalink: string
  thumbnail_url?: string
}

interface InstagramFeedProps {
  username: string
  token: string
  enabled: boolean
}

export default function InstagramFeed({ username, token, enabled }: InstagramFeedProps) {
  const [media, setMedia] = useState<InstagramMedia[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!enabled || !token) return

    fetch(
      `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url&access_token=${token}&limit=8`
    )
      .then((res) => {
        if (!res.ok) throw new Error("Instagram API error")
        return res.json()
      })
      .then((data) => {
        if (data?.data) {
          setMedia(data.data.slice(0, 8))
        }
      })
      .catch((err) => {
        console.error("Instagram feed error:", err)
        setError(true)
      })
  }, [enabled, token])

  if (!enabled || !token || error || media.length === 0) return null

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-stone-800">Instagram&apos;dan Son Paylaşımlar</h2>
        <p className="text-stone-500 mt-2">
          <a
            href={`https://www.instagram.com/${username}/`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-stone-800 transition-colors"
          >
            @{username}
          </a>
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {media.map((post) => (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative aspect-square overflow-hidden rounded-lg bg-stone-100"
          >
            <img
              src={post.thumbnail_url || post.media_url}
              alt={post.caption || "Instagram gönderisi"}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </span>
            </div>
            {post.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white text-xs leading-relaxed line-clamp-2">{post.caption}</p>
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  )
}
