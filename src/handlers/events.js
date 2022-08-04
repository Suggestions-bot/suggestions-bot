const fs = require("fs");
const Logger = require("./logger");
const allevents = [];
module.exports = async (client) => {
    try {
        try {
            const stringlength = 69;
            Logger.chunkmessage("{reset} YSH loaded successfully!");
            Logger.chunkmessage("");
            Logger.chunkmessage(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`)
            Logger.chunkmessage(`     ┃ ` + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃")
            Logger.chunkmessage(`     ┃ ` + `YSH` + " ".repeat(-1 + stringlength - ` ┃ `.length - `YSH`.length) + "┃")
            Logger.chunkmessage(`     ┃ ` + `YuiServiceHandler - No more code-breaking errors for you :)` + " ".repeat(-1 + stringlength - ` ┃ `.length - `YuiServiceHandler - No more code-breaking errors for you :)`.length) + "┃")
            Logger.chunkmessage(`     ┃ ` + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃")
            Logger.chunkmessage(`     ┃ ` + `By SleepyYui` + " ".repeat(-1 + stringlength - ` ┃ `.length - `By SleepyYui`.length) + "┃")
            Logger.chunkmessage(`     ┃ ` + `Discord: Yui#9097` + " ".repeat(-1 + stringlength - ` ┃ `.length - `Discord: Yui#9097`.length) + "┃")
            Logger.chunkmessage(`     ┃ ` + " ".repeat(-1 + stringlength - ` ┃ `.length) + "┃")
            Logger.chunkmessage(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`)
            Logger.chunkmessage("")
        } catch(e) { Logger.error("Error printing startup message", e) }
        let amount = 0;
        const load_dir = (dir) => {
            const event_files = fs.readdirSync(`./src/events/${dir}`).filter((file) => file.endsWith(".js"));
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
        await ["client", "guild"].forEach(e => load_dir(e));
        Logger.info(`Loaded ${amount} events.`);

    } catch (e) {
        Logger.error(`Error loading events.`, `${e}`);
    }
};
