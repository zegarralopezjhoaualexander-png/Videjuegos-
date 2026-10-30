function withProtocol(input) {
  if (/^https?:\/\//i.test(input)) {
    return input;
  }

  if (input.startsWith("//")) {
    return `https:${input}`;
  }

  return `https://${input}`;
}

export function getYouTubeTrailer(value) {
  const input = typeof value === "string" ? value.trim() : "";

  if (!input) {
    return null;
  }

  let url;

  try {
    url = new URL(withProtocol(input));
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./i, "").toLowerCase();
  const segments = url.pathname.split("/").filter(Boolean);
  const isYouTube =
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com" ||
    host === "youtu.be" ||
    host === "youtube-nocookie.com";

  if (!isYouTube) {
    return null;
  }

  if (url.pathname.startsWith("/results")) {
    return { type: "search", url: url.toString() };
  }

  let id = "";

  if (host === "youtu.be") {
    id = segments[0] || "";
  } else if (
    host === "youtube.com" ||
    host === "m.youtube.com" ||
    host === "music.youtube.com"
  ) {
    if (url.pathname === "/watch") {
      id = url.searchParams.get("v") || "";
    } else if (["embed", "shorts", "live", "v"].includes(segments[0])) {
      id = segments[1] || "";
    }
  } else if (host === "youtube-nocookie.com") {
    if (segments[0] === "embed") {
      id = segments[1] || "";
    }
  }

  if (!/^[A-Za-z0-9_-]{6,}$/.test(id)) {
    return null;
  }

  return {
    type: "embed",
    url: `https://www.youtube.com/embed/${id}`,
  };
}
