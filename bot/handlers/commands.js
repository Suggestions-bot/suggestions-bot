const {readdirSync} = require("fs");
const Logger = require('../../logger');

Logger.info("Loading YSH");
module.exports = (client) => {
  try {
    /* let amount = 0;
    readdirSync("./src/commands/").forEach((dir) => {
        const commands = readdirSync(`./src/commands/${dir}/`).filter((file) => file.endsWith(".js"));
        for (let file of commands) {
            let pull = require(`../commands/${dir}/${file}`);
            if (pull.name) {
                client.commands.set(pull.name, pull);
                amount++;
            } else {
                Logger.warn(`Missing a help.name, or help.name is not a string.`, `${file}`);
                continue;
            }
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach((alias) => client.aliases.set(alias, pull.name));
        }
    }); */
    Logger.info(`"Normal" Commands are disabled, to change that edit \`src/handlers/commands.js\`.`);
    // Logger.info(`Loaded ${amount} commands.`);
  } catch (e) {
    Logger.error(`Error loading commands.`, `${e}`);
  }
};
