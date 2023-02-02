const Logger = require("../../handlers/logger");
const modals = require("discord-modals");
const db = require("../../../database");
const logger = require("../../handlers/logger");

module.exports = {
    name: "edit", //the command name for the Slash Command
    description: "Edit your suggestion.", //the command description for Slash Command Overview
    cooldown: 5, //the cooldown for the command in seconds (max. 60)
    memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [

        {
            "String": {
                name: "message-id",
                description: "The message ID of the message you want to edit.",
                required: true
            }
        },
        {"String": {name: "new-suggestion", description: "Your new suggestion.", required: true}},

    ],
    run: async (client, interaction) => {
        try {
            const {options} = interaction;

            language = data.get("Language_" + interaction.guild?.id)
            if (language == null) {
                language = "lang_en"
            }
            const lang = require(`../../botconfig/languages/${language}.json`);

            let key = "SuggestionsChannel_" + interaction.guild.id;
            let value = data.fetch(key)?.channel
            let channel = client.channels.cache.get(value);
            let userID = interaction.user.id;
            let userKey = "Suggestions_" + interaction.guild.id + "_" + userID.toString() + ".sugs";
            let udata = data.fetch(userKey);

            if (udata == null) return interaction.reply(
                {content: lang.suggest_none, ephemeral: true}
            )


            let messageUrlString = await udata.map((message, index) => `${message.url}`).join(" ");
            let messageUrlArray = messageUrlString.split(" ");
            let messageIdArray = messageUrlArray.map(message => message.split("/")[6]);
            let givenMessageString = options.getString("message-id");
            // Logger.info(givenMessageString);
            let givenMessageID = "";

            if (givenMessageString.includes("/")) {
                givenMessageID = givenMessageString.split("/")[6];
            } else {
                givenMessageID = givenMessageString;
            }

            // console.log(messageUrlString);
            // console.log(messageUrlArray);
            // console.log(messageIdArray);

            if (!messageIdArray.includes(givenMessageID)) return interaction.reply(
                {content: lang.suggest_none_found, ephemeral: true}
            );

            // log an error whilst getting the message
            let message = await channel.messages.fetch(givenMessageID.toString())
                .catch(err => {
                    interaction.reply(
                        {content: lang.suggest_none_found, ephemeral: true}
                    )
                    return false;
                });

            if (message == false) return;

            let newMessage = options.getString("new-suggestion");
            let embed = message.embeds[0];

            //logger.info(embed.fields[2]);

            if (embed.fields[2] != null) {
                return interaction.reply(
                    {content: lang.suggest_cannot_edit, ephemeral: true}
                );
            }


            let editedEmbed = {
                author: embed.author, color: embed.color, timestamp: embed.timestamp, footer: embed.footer,
                description: newMessage, fields: [
                    embed.fields[0],
                    embed.fields[1],
                ]
            }

            message.edit({components: message.components, embeds: [editedEmbed]})
            interaction.reply(
                {content: lang.suggest_edit_success, ephemeral: true}
            );

        } catch (e) {
            Logger.error(e);
        }
    }
}
