//here the event starts
const Logger = require("../../handlers/logger");
module.exports = client => {
    Logger.info(`Disconnected at ${new Date()}.`);
}

