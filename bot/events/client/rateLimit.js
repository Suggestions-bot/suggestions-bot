//here the event starts
const Logger = require("../../../logger");
module.exports = (client, rateLimitData) => {
    Logger.super_error(`${rateLimitData.method} ${rateLimitData.path}`, `${rateLimitData}`);
}
