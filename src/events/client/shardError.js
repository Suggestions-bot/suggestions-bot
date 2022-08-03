//here the event starts
const Logger = require("../../handlers/logger");
module.exports = (client, error, id) => {
    Logger.error(`[${String(new Date).split(" ", 5).join(" ")}] Shard #${id} Errored:`, error);
}
