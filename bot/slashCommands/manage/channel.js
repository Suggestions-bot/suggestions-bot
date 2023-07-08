const Logger = require("../../../logger");
const db = require("../../../database");
const Discord = require("discord.js");

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
                name: "channel", description: "Set the channel to send / recieve suggestions in.", required: false
            }
        }, {
            "StringChoices": {
                name: "remove",
                description: "Remove the existing suggestion channel?",
                required: false,
                choices: [["Yes", "true"], ["No", "false"]]
            }
        },

    ], run: async (client, interaction) => {
        try {
            const {options} = interaction;

            let channel = options.getChannel("channel")?.id;
            let remove = options.getString("remove");
            let language = await db.getServerLanguage(interaction.guild?.id || 0)

            if (remove === "true") {
                const lang = require(`../../botconfig/languages/${language}.json`);

                try {
                    await db.setServerSuggestionChannel(interaction.guild?.id || 0, null)
                    interaction.reply({content: lang.reset_suggestion_channel, ephemeral: true})
                } catch (e) {
                    interaction.reply({content: lang.reset_suggestion_channel_error, ephemeral: true})
                }
            } else {

                if (language == null) {
                    language = "lang_en"
                }
                const lang = require(`../../botconfig/languages/${language}.json`);
                if (channel == null) {
                    await interaction.reply({
                        content: lang.choose_valid_option, ephemeral: true
                    });
                } else {
                    await db.setServerSuggestionChannel(interaction.guild?.id, channel)
                    interaction.reply({content: lang.set_suggestion_channel + " <#" + channel + ">.", ephemeral: true})
                }

                // get channel by id
                channel = await interaction.guild?.channels.cache.get(channel);
                let suggestMessageId = await db.getSuggestMessage(interaction.guild?.id);
                let suggestMessage;
                try {
                    suggestMessage = await channel.messages.fetch(suggestMessageId);
                } catch (e) {
                    suggestMessage = null;
                }
                // delete the old suggestion message
                if (suggestMessage) {
                    try {
                        await suggestMessage.delete();
                    } catch (e) {
                        e = null;
                    }
                }

                const serverdata = await db.getAllServerSettings(interaction.guild?.id);

                let ecolor;
                if (serverdata["suggestion_embed_color"] !== null && serverdata["suggestion_embed_color"] !== undefined && serverdata["suggestion_embed_color"] !== "") {
                    ecolor = serverdata["suggestion_embed_color"];
                } else {
                    ecolor = "2C2F33";
                }
                // create an embed with a blue button that says suggest
                let suggestEmbed = new Discord.MessageEmbed()
                    .setTitle(lang.suggest_embed_title)
                    .setDescription(lang.suggest_embed_desc)
                    .setColor(ecolor);
                let suggestButton = new Discord.MessageButton()
                    .setCustomId("suggest")
                    .setStyle("PRIMARY")
                    .setLabel(lang.suggest_embed_button)
                    .setEmoji("📝");
                let suggestActionRow = new Discord.MessageActionRow().addComponents(suggestButton);
                // send the embed
                suggestMessage = await channel.send({embeds: [suggestEmbed], components: [suggestActionRow]});
                // set the message id in the database
                await db.setSuggestMessage(interaction.guild?.id, suggestMessage.id);
            }
        } catch (e) {
            Logger.error(e);
        }
    }
}
