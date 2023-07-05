//here the event starts
const Logger = require("../../../logger");
module.exports = (client, rateLimitData) => {
    Logger.super_error(`Rate Limited (${rateLimitData.method}) at Path: ${rateLimitData.path}`, `Global: ${rateLimitData.global} | Limit: ${rateLimitData.limit} | Timeout: ${rateLimitData.timeout}ms`);
}
