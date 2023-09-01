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
        description: "Remove ALL of the existing suggestion channels? It will only remove the selected or all.",
        required: false,
        choices: [["Yes", "true"], ["No", "false"]]
      }
    },

  ], run: async (client, interaction) => {
    try {
      const {options} = interaction;

      await interaction.deferReply({ephemeral: true});

      let channel = options.getChannel("channel")?.id;
      let remove = options.getString("remove");
      let language = await db.getServerLanguage(interaction.guild?.id || 0)

      if (remove === "true") {
        const lang = require(`../../botconfig/languages/${language}.json`);

        try {
          if (channel == null) {
            await db.setServerSuggestionChannels(interaction.guild?.id || 0, null)
            interaction.followUp({content: lang.reset_suggestion_channel, ephemeral: true})
          } else {
            let channels = await db.getServerSuggestionChannels(interaction.guild?.id || 0)
            if (channels.includes(channel)) {
              channels.splice(channels.indexOf(channel), 1);
              let channelObject = {}
              channelObject["channel_id_array"] = channels
              await db.setServerSuggestionChannels(interaction.guild?.id || 0, channelObject)
              interaction.followUp({content: lang.reset_suggestion_channel, ephemeral: true})
            } else {
              await interaction.followUp({
                content: lang.choose_valid_option, ephemeral: true
              });
            }
          }
        } catch (e) {
          Logger.error(e)
          console.log(e.stack)
          interaction.followUp({content: lang.reset_suggestion_channel_error, ephemeral: true})
        }
      } else {

        if (language == null) {
          language = "lang_en"
        }
        const lang = require(`../../botconfig/languages/${language}.json`);
        if (channel == null) {
          await interaction.followUp({
            content: lang.choose_valid_option, ephemeral: true
          });
        } else {
          // make sure that the server does not have the max limit of suggestion channels
          let channels = await db.getServerSuggestionChannels(interaction.guild?.id || 0)
          if (channels?.length >= await db.getServerMaxChannels(interaction.guild?.id || 0)) {
            await interaction.followUp({
              content: lang.max_suggestion_channels, ephemeral: true
            });
            return;
          }
          await db.addServerSuggestionChannel(interaction.guild?.id, channel)
          interaction.followUp({content: lang.set_suggestion_channel + " <#" + channel + ">.", ephemeral: true})
        }

        // get channel by id
        channel = await interaction.guild?.channels.cache.get(channel);
        let suggestMessageId = await db.getSuggestMessage(channel?.id);
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
        try {
          if (serverdata["suggestion_embed_color"] !== null && serverdata["suggestion_embed_color"] !== undefined && serverdata["suggestion_embed_color"] !== "") {
            ecolor = serverdata["suggestion_embed_color"];
          } else {
            ecolor = "2C2F33";
          }
        } catch (e) {
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
        try {
          suggestMessage = await channel.send({embeds: [suggestEmbed], components: [suggestActionRow]});
          // set the message id in the database
          await db.setSuggestMessage(channel?.id, suggestMessage?.id);
        } catch (e) {
          await interaction.followUp({
            content: lang.set_suggestion_channel_error, ephemeral: true
          });
        }
      }
    } catch (e) {
      Logger.error(e);
      Logger.error(e.stack)
    }
  }
}
