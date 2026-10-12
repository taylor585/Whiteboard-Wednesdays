declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    YOUTUBE_API_KEY?: string;
    BUCKET?: R2Bucket;
  }
}
