import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/links/metadata
 * Fetches metadata (title, description) from a URL
 * Used by LinkCapturePanel for auto-filling link titles
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    // Validate URL
    const parsedUrl = new URL(url);

    // Fetch the page with a timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        // Identify as a bot for sites that serve different content
        "User-Agent": "AutoFlow/1.0 (Link Metadata Fetcher)",
        "Accept": "text/html,application/xhtml+xml",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json(
        { title: null, description: null, error: "Failed to fetch page" },
        { status: 200 }
      );
    }

    const html = await response.text();

    // Extract title from HTML
    // Try Open Graph title first, then regular title tag
    let title: string | null = null;
    let description: string | null = null;

    // OG title
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
    if (ogTitleMatch) {
      title = decodeHtmlEntities(ogTitleMatch[1]);
    }

    // Fallback to <title> tag
    if (!title) {
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) {
        title = decodeHtmlEntities(titleMatch[1].trim());
      }
    }

    // OG description
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
      || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
    if (ogDescMatch) {
      description = decodeHtmlEntities(ogDescMatch[1]);
    }

    // Fallback to meta description
    if (!description) {
      const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
        || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
      if (descMatch) {
        description = decodeHtmlEntities(descMatch[1]);
      }
    }

    // Extract favicon
    let favicon: string | null = null;
    const faviconMatch = html.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*href=["']([^"']+)["']/i)
      || html.match(/<link[^>]*href=["']([^"']+)["'][^>]*rel=["'](?:shortcut )?icon["']/i);
    if (faviconMatch) {
      const faviconUrl = faviconMatch[1];
      // Make absolute URL if relative
      favicon = faviconUrl.startsWith("http")
        ? faviconUrl
        : new URL(faviconUrl, parsedUrl.origin).toString();
    }

    return NextResponse.json({
      title,
      description,
      favicon,
      domain: parsedUrl.hostname.replace("www.", ""),
    });
  } catch (error) {
    // Return empty metadata on error (don't fail the request)
    return NextResponse.json(
      { title: null, description: null, error: "Failed to fetch metadata" },
      { status: 200 }
    );
  }
}

/**
 * Decode common HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code, 10)))
    .replace(/&#x([a-fA-F0-9]+);/g, (_, code) => String.fromCharCode(parseInt(code, 16)));
}
