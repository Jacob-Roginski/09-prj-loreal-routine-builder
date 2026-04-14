/**
 * Configuration File for L'Oréal Routine Builder
 *
 * UPDATE THIS WITH YOUR CLOUDFLARE WORKER URL
 */

const CONFIG = {
  // Replace this with your actual Cloudflare Worker URL
  // Get this URL after deploying the cloudflare-worker.js file
  // Example: https://routine-builder.yourusername.workers.dev/
  CLOUDFLARE_WORKER_URL: "YOUR_CLOUDFLARE_WORKER_URL_HERE",
};

// Validate configuration
if (
  CONFIG.CLOUDFLARE_WORKER_URL === "YOUR_CLOUDFLARE_WORKER_URL_HERE" ||
  !CONFIG.CLOUDFLARE_WORKER_URL
) {
  console.warn(
    "⚠️ IMPORTANT: Update the CLOUDFLARE_WORKER_URL in config.js with your actual worker URL.",
  );
}
