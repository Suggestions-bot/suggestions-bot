//here the event starts
const Logger = require("../../handlers/logger");
module.exports = client => {
    Logger.info(`Reconnecting at ${new Date()}.`);
}
