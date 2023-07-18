//here the event starts
const Logger = require("../../../logger");
module.exports = client => {
  Logger.info(`Disconnected at ${new Date()}.`);
}

