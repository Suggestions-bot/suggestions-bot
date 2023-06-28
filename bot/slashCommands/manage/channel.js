const Logger = require("../../../logger");
const db = require("../../../database");

module.exports = {
    name: "channel", //the command name for the Slash Command
    description: "Manage the suggestions channel.", //the command description for Slash Command Overview
    cooldown: 5, //the cooldown for the command in seconds (max. 60)
    memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [

        {
            "Channel": {
                name: "channel",
                description: "Set the channel to send / recieve suggestions in.",
                required: false
            }
        },
        {
            "StringChoices": {
                name: "remove",
                description: "Remove the existing suggestion channel?",
                required: false,
                choices: [["Yes", "true"], ["No", "false"]]
            }
        },

    ],
    run: async (client, interaction) => {
        try {
            const {options} = interaction;

            let channel = options.getChannel("channel").id;
            let remove = options.getString("remove");
            let language = await db.getServerLanguage(interaction.guild?.id)

            if (remove === "true") {
                const lang = require(`../../botconfig/languages/${language}.json`);

                try {
                    await db.setServerSuggestionChannel(interaction.guild?.id, null)
                    interaction.reply(
                        {content: lang.reset_suggestion_channel, ephemeral: true}
                    )
                } catch (e) {
                    interaction.reply(
                        {content: lang.reset_suggestion_channel_error, ephemeral: true}
                    )
                }
            } else {

                if (language == null) {
                    language = "lang_en"
                }
                const lang = require(`../../botconfig/languages/${language}.json`);
                if (channel == null) {
                    await interaction.reply({
                        content: lang.choose_valid_option,
                    });
                } else {
                    await db.setServerSuggestionChannel(interaction.guild?.id, channel)
                    interaction.reply(
                        {content: lang.set_suggestion_channel + " <#" + channel + ">.", ephemeral: true}
                    )
                }
            }
        } catch (e) {
            Logger.error(e);
        }
    }
}
