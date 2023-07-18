const Logger = require("../../../logger");
const modals = require("discord-modals");
const db = require("../../../database");
const Discord = require("discord.js");

module.exports = {
  name: "suggestion", //the command name for the Slash Command
  description: "Manage a suggestion.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "message-id",
        description: "The message ID of the message you want to manage.",
        required: true
      }
    },
    {
      "StringChoices": {
        name: "options",
        description: "Action you want to do",
        required: true,
        choices: [["Accept", "accept"], ["Decline", "decline"], ["Reset", "reset"], ["Delete", "delete"]]
      }
    },
    {
      "String": {
        name: "comment",
        description: "A comment for the suggestion that is shown below the embed.",
        required: false
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;

      const language = await db.getServerLanguage(interaction.guild.id)
      const lang = require(`../../botconfig/languages/${language}.json`);

      let givenMessageString = options.getString("message-id");
      let action = options.getString("options");
      let channels = await db.getServerSuggestionChannels(interaction.guild.id)

      let givenMessageID = "";

      if (givenMessageString.includes("/")) {
        givenMessageID = givenMessageString.split("/")[6];
      } else {
        givenMessageID = givenMessageString;
      }

      let gottenMessage = false;
      let message;
      for (let channel in channels) {
        channel = channels[channel];
        channel = interaction?.guild.channels.cache.get(channel);
        if (!channel) continue;
        try {
          message = await channel.messages.fetch(givenMessageID.toString())
        } catch (e) {
          message = false;
        }
        if (message) {
          gottenMessage = true;
          break;
        }
      }
      if (!gottenMessage) return interaction.reply(
        {content: lang.suggest_none_found, ephemeral: true}
      );

      if (message === false) return;

      if (message.author.id.toString() !== client.user.id.toString()) {
        interaction.reply(
          {content: lang.suggest_bot_not_author, ephemeral: true}
        );
        return;
      }

      const embedData = await db.getServerEmbedData(interaction.guild.id);
      const uicon = embedData?.upvote_emoji || "<:thumbs_up_bot:1080565677900976242>";
      const dicon = embedData?.downvote_emoji || "<:thumbs_down_bot:1080566077504880761>";

      if (action === "accept") {
        let embed = message.embeds[0];
        let newEmbed = {
          author: embed.author, color: embed.color, timestamp: embed.timestamp, footer: embed.footer,
          description: embed.description, fields: [
            embed.fields[0],
            embed.fields[1],
            {
              name: "**" + lang.suggest_accepted + "** <a:accept_bot:1000710815562866759>",
              value: lang.suggest_accepted_text,
              inline: false
            },
          ]
        }

        if (options.getString("comment")) {
          newEmbed.fields.push({
            name: "**" + lang.suggest_comment + "**",
            value: options.getString("comment"),
            inline: false
          })
        }

        await message.edit({
          components: [
            new Discord.MessageActionRow()
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId("up")
                  .setStyle("SUCCESS")
                  .setLabel(lang.suggest_upvote)
                  .setEmoji(`${uicon}`)
                  .setDisabled(true),
                new Discord.MessageButton()
                  .setCustomId("down")
                  .setStyle("DANGER")
                  .setLabel(lang.suggest_downvote)
                  .setEmoji(`${dicon}`)
                  .setDisabled(true),
                new Discord.MessageButton()
                  .setCustomId("accepted")
                  .setStyle("PRIMARY")
                  .setLabel(lang.suggest_accepted)
                  .setEmoji(`${embedData?.accepted_emoji || "<a:accept_bot:1000710815562866759>"}`)
              )
          ], embeds: [newEmbed]
        });
        await db.setSuggestionAccepted(givenMessageID.toString(), interaction.guild.id);
        interaction.reply(
          {content: lang.suggest_accepted_text, ephemeral: true}
        );

        const thread = await db.getSuggestionThread(interaction.guild.id, givenMessageID.toString());
        if (thread) {
          try {
            // get thread by id
            const threadChannel = await client.channels.fetch(thread);
            // make thread private
            await threadChannel.setLocked(true, "Suggestion accepted");
            // close thread
            await threadChannel.setArchived(true);
          } catch (e) {
            e = undefined
          }
        }

      } else if (action === "decline") {
        let embed = message.embeds[0];
        let newEmbed = {
          author: embed.author, color: embed.color, timestamp: embed.timestamp, footer: embed.footer,
          description: embed.description, fields: [
            embed.fields[0],
            embed.fields[1],
            {
              name: "**" + lang.suggest_declined + "** <a:deny_bot:1000710816980533278>",
              value: lang.suggest_declined_text,
              inline: false
            },
          ]
        }

        if (options.getString("comment")) {
          newEmbed.fields.push({
            name: "**" + lang.suggest_comment + "**",
            value: options.getString("comment"),
            inline: false
          })
        }

        await message.edit({
          components: [
            new Discord.MessageActionRow()
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId("up")
                  .setStyle("SUCCESS")
                  .setLabel(lang.suggest_upvote)
                  .setEmoji(`${uicon}`)
                  .setDisabled(true),
                new Discord.MessageButton()
                  .setCustomId("down")
                  .setStyle("DANGER")
                  .setLabel(lang.suggest_downvote)
                  .setEmoji(`${dicon}`)
                  .setDisabled(true),
                new Discord.MessageButton()
                  .setCustomId("declined")
                  .setStyle("PRIMARY")
                  .setLabel(lang.suggest_declined)
                  .setEmoji(`${embedData?.denied_emoji || "<a:deny_bot:1000710816980533278>"}`)
              )
          ], embeds: [newEmbed]
        });
        await db.setSuggestionDenied(givenMessageID.toString(), interaction.guild.id);
        interaction.reply(
          {content: lang.suggest_declined_text, ephemeral: true}
        );

        const thread = await db.getSuggestionThread(interaction.guild.id, givenMessageID.toString());
        if (thread) {
          try {
            // get thread by id
            const threadChannel = await client.channels.fetch(thread);
            // make thread private
            await threadChannel.setLocked(true, "Suggestion declined");
            // close thread
            await threadChannel.setArchived(true);
          } catch (e) {
            e = undefined
          }
        }

      } else if (action === "reset") {
        let embed = message.embeds[0];
        let newEmbed = {
          author: embed.author, color: embed.color, timestamp: embed.timestamp, footer: embed.footer,
          description: embed.description, fields: [
            embed.fields[0],
            embed.fields[1],
          ]
        }

        await message.edit({
          components: [
            new Discord.MessageActionRow()
              .addComponents(
                new Discord.MessageButton()
                  .setCustomId("up")
                  .setStyle("SUCCESS")
                  .setLabel(lang.suggest_upvote)
                  .setEmoji(`${uicon}`),
                new Discord.MessageButton()
                  .setCustomId("down")
                  .setStyle("DANGER")
                  .setLabel(lang.suggest_downvote)
                  .setEmoji(`${dicon}`),
              )
          ],
          embeds: [newEmbed]
        });
        await db.setSuggestionPending(givenMessageID.toString(), interaction.guild.id);
        interaction.reply(
          {content: lang.suggest_reset_to_og_state, ephemeral: true}
        );

        const thread = await db.getSuggestionThread(interaction.guild.id, givenMessageID.toString());
        if (thread) {
          try {
            // get thread by id
            const threadChannel = await client.channels.fetch(thread);
            // close thread
            await threadChannel.setArchived(false);
            // make thread private
            await threadChannel.setLocked(false, "Suggestion reset");
          } catch (e) {
            e = undefined
          }
        }
      } else if (action === "delete") {
        try {
          await message.delete();
        } catch (e) {
          await interaction.reply({content: lang.suggest_error_deleting, ephemeral: true});
        }

        await db.setDeleteSuggestion(interaction.guild.id, givenMessageID.toString());
        interaction.reply(
          {content: lang.suggest_deleted, ephemeral: true}
        );


      }
    } catch (e) {
      Logger.error(e);
    }
  }
}
