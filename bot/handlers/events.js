const fs = require("fs");
const Logger = require("../../logger");
const allevents = [];
module.exports = async (client) => {
  try {
    Logger.info("Loading YSH");
    let amount = 0;
    const load_dir = (dir) => {
      const event_files = fs.readdirSync(`./bot/events/${dir}`).filter((file) => file.endsWith(".js"));
      for (const file of event_files) {
        try {
          const event = require(`../events/${dir}/${file}`)
          let eventName = file.split(".")[0];
          allevents.push(eventName);
          client.on(eventName, event.bind(null, client));
          amount++;
        } catch (e) {
          Logger.error(`Error loading event`, `${e}`);
        }
      }
    }
    Logger.info("YSH loaded successfully!");
    ["client", "guild"].forEach(e => load_dir(e));
    Logger.info(`Loaded ${amount} events.`);
  } catch (e) {
    Logger.error(`Error loading events.`, `${e}`);
  }
};
