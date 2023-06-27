const Logger = require("../../../logger");
const modals = require("discord-modals");
const db = require("../../../database");
const logger = require("../../../logger");

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

            const language = await db.getServerLanguage(interaction.guild.id)
            const lang = require(`../../botconfig/languages/${language}.json`);

            let value = await db.getServerSuggestionChannel(interaction.guild.id)
            let channel = client.channels.cache.get(value);
            let userID = interaction.user.id;
            let udata = db.getAllUserSuggestions(interaction.guild.id, userID);

            if (udata == null) return interaction.reply(
                {content: lang.suggest_none, ephemeral: true}
            )


            let messageIdArray = udata.map(x => x.message_id);
            let givenMessageString = options.getString("message-id");

            let givenMessageID = "";

            if (givenMessageString.includes("/")) {
                givenMessageID = givenMessageString.split("/")[6];
            } else {
                givenMessageID = givenMessageString;
            }

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

            if (message === false) return;

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
