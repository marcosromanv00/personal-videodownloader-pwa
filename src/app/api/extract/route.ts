import { NextResponse } from "next/server";
import { z } from "zod";

const requestSchema = z.object({
  url: z.string().url(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url } = requestSchema.parse(body);

    const domain = new URL(url).hostname.replace("www.", "");
    let result = null;

    if (domain.includes("reddit.com")) {
      result = await extractReddit(url);
    } else if (domain.includes("tiktok.com")) {
      result = await extractTikTok(url);
    } else if (domain.includes("instagram.com")) {
      result = await extractInstagram(url);
    } else {
      // Generic extraction fallback
      result = await extractGeneric(url, domain);
    }

    if (!result) {
      return NextResponse.json({ error: "No se pudo extraer contenido de este enlace" }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Extraction error:", error);
    return NextResponse.json({ error: error.message || "Error interno" }, { status: 500 });
  }
}

async function extractReddit(url: string) {
  const jsonUrl = url.endsWith("/") ? `${url.slice(0, -1)}.json` : `${url}.json`;
  const res = await fetch(jsonUrl);
  const data = await res.json();
  
  const post = data[0]?.data?.children[0]?.data;
  if (!post) return null;

  const videoUrl = post.secure_media?.reddit_video?.fallback_url || post.url;
  
  return {
    title: post.title,
    thumbnail: post.thumbnail && post.thumbnail !== "self" ? post.thumbnail : null,
    downloadUrl: videoUrl,
    source: "Reddit",
  };
}

async function extractTikTok(url: string) {
  // Using oEmbed for metadata
  const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
  const res = await fetch(oembedUrl);
  if (!res.ok) return null;
  const data = await res.json();

  return {
    title: data.title,
    thumbnail: data.thumbnail_url,
    downloadUrl: url, // TikTok needs a specialized proxy for direct video download
    source: "TikTok",
    note: "Se requiere un proxy especializado para descarga directa sin marca de agua.",
  };
}

async function extractInstagram(url: string) {
  // Instagram is very restricted. We'll try to look for basic OG tags
  // Usually requires a specialized API or login.
  return {
    title: "Publicación de Instagram",
    thumbnail: null,
    downloadUrl: url,
    source: "Instagram",
  };
}

async function extractGeneric(url: string, domain: string) {
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    const html = await res.text();

    const titleMatch = html.match(/<meta property="og:title" content="([^"]+)"/);
    const imageMatch = html.match(/<meta property="og:image" content="([^"]+)"/);
    const videoMatch = html.match(/<meta property="og:video" content="([^"]+)"/);

    return {
      title: titleMatch ? titleMatch[1] : "Contenido detectado",
      thumbnail: imageMatch ? imageMatch[1] : null,
      downloadUrl: videoMatch ? videoMatch[1] : url,
      source: domain,
    };
  } catch {
    return null;
  }
}
