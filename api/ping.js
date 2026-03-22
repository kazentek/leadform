/**
 * GET /api/ping
 * Lightweight keepalive endpoint.
 * Called every 5 minutes by an external pinger to prevent cold starts
 */
module.exports = function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    ok: true,
    ts: Date.now(),
    uptime: Math.round(process.uptime()) + "s",
  });
};
