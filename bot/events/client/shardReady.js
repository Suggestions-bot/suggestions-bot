//here the event starts
const Logger = require("../../../logger");
module.exports = (client, id) => {
  Logger.info(`[${String(new Date).split(" ", 5).join(" ")}] Shard #${id} Ready`);
}
