/* Magic Mirror²
 * Module: MMM-DWD-Pollen
 * node_helper.js — Server-side data fetcher
 *
 * Replaces deprecated `request` package with built-in Node.js https.
 * Adds: response-size cap, request timeout, automatic retry with
 * exponential back-off, and safe JSON parsing.
 */

const NodeHelper = require("node_helper");
const https = require("https");

const DWD_URL =
  "https://opendata.dwd.de/climate_environment/health/alerts/s31fg.json";
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024; // 2 MB safety cap
const REQUEST_TIMEOUT_MS = 15_000;
const MAX_RETRIES = 2;

module.exports = NodeHelper.create({
  start() {
    console.log("[MMM-DWD-Pollen] Helper started.");
  },

  /**
   * Fetch JSON from a URL with size-limiting, timeout, and retries.
   * @param {string} url
   * @param {number} attempt — current retry count (internal)
   * @returns {Promise<object>}
   */
  fetchJSON(url, attempt = 0) {
    return new Promise((resolve, reject) => {
      const req = https.get(url, { timeout: REQUEST_TIMEOUT_MS }, (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode}`));
        }

        const chunks = [];
        let bytes = 0;

        res.on("data", (chunk) => {
          bytes += chunk.length;
          if (bytes > MAX_RESPONSE_BYTES) {
            res.destroy();
            return reject(new Error("Response exceeded size limit"));
          }
          chunks.push(chunk);
        });

        res.on("end", () => {
          try {
            resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
          } catch (err) {
            reject(new Error(`JSON parse error: ${err.message}`));
          }
        });

        res.on("error", reject);
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timed out"));
      });
      req.on("error", reject);
    }).catch((err) => {
      if (attempt < MAX_RETRIES) {
        const delay = 1000 * 2 ** attempt;
        console.warn(
          `[MMM-DWD-Pollen] Retry ${attempt + 1}/${MAX_RETRIES} in ${delay} ms — ${err.message}`,
        );
        return new Promise((r) => setTimeout(r, delay)).then(() =>
          this.fetchJSON(url, attempt + 1),
        );
      }
      throw err;
    });
  },

  async getData() {
    try {
      const data = await this.fetchJSON(DWD_URL);
      this.sendSocketNotification("DWD_POLLEN_RESULT", data);
    } catch (err) {
      console.error(`[MMM-DWD-Pollen] Failed to load data: ${err.message}`);
      this.sendSocketNotification("DWD_POLLEN_ERROR", err.message);
    }
  },

  socketNotificationReceived(notification) {
    if (notification === "DWD_POLLEN_REQUEST") {
      this.getData();
    }
  },
});
