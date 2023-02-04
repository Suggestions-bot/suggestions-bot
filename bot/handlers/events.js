const fs = require("fs");
const Logger = require("./logger");
const allevents = [];
module.exports = async (client) => {
    try {
        try {
            Logger.chunkmessage("{reset} YSH loaded successfully!");
        } catch (e) {
            Logger.error("Error printing startup message", e)
        }
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
        ["client", "guild"].forEach(e => load_dir(e));
        Logger.info(`Loaded ${amount} events.`);

    } catch (e) {
        Logger.error(`Error loading events.`, `${e}`);
    }
};
