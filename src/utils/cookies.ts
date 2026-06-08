import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Logger } from "./logging.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

function getCookiePath(): string | undefined {
  const envPath = process.env.YOUTUBE_COOKIE_PATH;
  if (envPath) return envPath;

  const defaultPath = path.resolve(
    __dirname,
    "..",
    "..",
    "cookies",
    "youtube.txt",
  );
  if (fs.existsSync(defaultPath)) return defaultPath;

  return undefined;
}

export function loadYoutubeCookies(): string | undefined {
  const cookiePath = getCookiePath();
  if (!cookiePath) {
    Logger.debug("[Cookies] No YouTube cookie file found");
    return undefined;
  }

  try {
    const text = fs.readFileSync(cookiePath, "utf-8");
    const lines = text
      .split("\n")
      .filter((line) => line && !line.startsWith("#"));

    const cookies = lines
      .map((line) => line.trim().split("\t"))
      .filter((parts) => parts.length >= 7 && parts[4] !== "0")
      .map((parts) => `${parts[5]}=${parts[6]}`);

    if (cookies.length === 0) {
      Logger.warn("[Cookies] YouTube cookie file is empty or invalid");
      return undefined;
    }

    Logger.debug(
      `[Cookies] Loaded ${cookies.length} cookies from ${cookiePath}`,
    );
    return cookies.join("; ");
  } catch (err) {
    Logger.warn(`[Cookies] Failed to load YouTube cookies: ${err}`);
    return undefined;
  }
}
