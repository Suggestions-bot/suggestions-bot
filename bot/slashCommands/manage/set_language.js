const Logger = require("../../handlers/logger");
const db = require("../../../database");

module.exports = {
    name: "language", //the command name for the Slash Command
    description: "Set the language that the bot uses to communitate with you. (Commands stay in English)", //the command description for Slash Command Overview
    cooldown: 5, //the cooldown for the command in seconds (max. 60)
    memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [

        {
            "StringChoices": {
                name: "language",
                description: "Select your preferred language",
                required: true,
                choices: [["English", "lang_en"], ["German", "lang_de"], ["Dutch", "lang_nl"], ["Russian", "lang_ru"], ["Spanish", "lang_es"]]
            }
        }

    ],
    run: async (client, interaction) => {
        try {
            const {options} = interaction;

            let language = options.getString("language");

            await db.setServerLanguage(interaction.guild.id.toString(), language);

            const lang = require(`../../botconfig/languages/${language}.json`);

            interaction.reply(
                {content: lang.change_language, ephemeral: true}
            )
        } catch (e) {
            Logger.error(e);
        }
    }
}
