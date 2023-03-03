//here the event starts
const Logger = require("../../handlers/logger");
module.exports = (client, error) => {
    Logger.warn(`${error}`);
}
