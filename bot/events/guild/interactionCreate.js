const Discord = require("discord.js");
const db = require("../../../database");
const modals = require("discord-modals");

module.exports = (client, interaction) => {
  if (interaction.channel.type === "dm" || !interaction.guild) {
    return interaction.reply({
      content: "This command can only be used in servers.",
    });
  }
  interaction.client = client;


  const CategoryName = interaction.commandName;
  let command = false;
  try {
    if (
      client.slashCommands.has(
        CategoryName + interaction.options.getSubcommand()
      )
    ) {
      command = client.slashCommands.get(
        CategoryName + interaction.options.getSubcommand()
      );
    }
  } catch {
    if (client.slashCommands.has("normal" + CategoryName)) {
      command = client.slashCommands.get("normal" + CategoryName);
    }
  }
  if (command) {
    //execute the Command
    command.run(client, interaction, interaction.member, interaction.guild);
  }
  if (interaction.isButton()) return buttons(interaction);

  if (interaction.type.toString() === "MODAL_SUBMIT")
    return modalSubmit(client, interaction);
};

async function confirmRevote(interaction, lang) {
  let edata = await db.getServerEmbedData(interaction.guild.id);
  let dicon = "<:thumbs_down_bot:1080566077504880761>";
  let uicon = "<:thumbs_up_bot:1080565677900976242>";
  if (edata) {
    dicon = edata.downvote_emoji;
    uicon = edata.upvote_emoji;
  }
  // console.log(interaction);
  // console.log(edata);
  // console.log(dicon);

  //try {
  await interaction.followUp({
    content: lang.already_voted_rechoice,
    components: [
      new Discord.MessageActionRow().addComponents(
        new Discord.MessageButton()
          .setCustomId("up-rechoice")
          .setStyle("SUCCESS")
          .setLabel(lang.suggest_upvote)
          .setEmoji(`${uicon}`),
        new Discord.MessageButton()
          .setCustomId("down-rechoice")
          .setStyle("DANGER")
          .setLabel(lang.suggest_downvote)
          .setEmoji(`${dicon}`)
      ),
    ],
    ephemeral: true,
  });
  /*} catch (e) {
      console.log(e);
      console.log(e.requestData.json.components[0].components);
  }*/

}

async function checkForAutoAccept(interaction, message, lang) {
  //console.log(interaction.guild.id) //696048541830742067
  const accept_upvotes = await db.getAcceptUpvotes(interaction.guild.id)
  //console.log(accept_upvotes)
  if (accept_upvotes) {
    //console.log(message.id)
    const voters = await db.getSuggestionVoters(interaction.guild.id, message.id);
    //console.log(voters)
    const upvotes = voters[0]?.upvotes;
    //console.log(upvotes)
    if (upvotes >= accept_upvotes) {
      const embedData = await db.getServerEmbedData(interaction.guild.id);
      //console.log(embedData)
      let embed = message.embeds[0];
      let editedEmbed = {
        author: embed.author,
        color: embed.color,
        timestamp: embed.timestamp,
        footer: embed.footer,
        description: embed.description,
        fields: [embed.fields[0], embed.fields[1], {
          name: "**" + lang.suggest_accepted + `** ${embedData?.accepted_emoji || "<a:accept_bot:1000710815562866759>"}`,
          value: lang.suggestion_auto_accept_upvotes,
          inline: false
        }],
      };
      const uicon = embedData?.upvote_emoji || "<:thumbs_up_bot:1080565677900976242>";
      const dicon = embedData?.downvote_emoji || "<:thumbs_down_bot:1080566077504880761>";
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
        ], embeds: [editedEmbed]
      });
      await db.setSuggestionAccepted(interaction.guild.id, message.id);
      const thread = await db.getSuggestionThread(interaction.guild.id, message.id);
      if (thread) {
        try {
          // get thread by id
          const threadChannel = await interaction.client.channels.fetch(thread);
          // make thread private
          await threadChannel.setLocked(true, "Suggestion accepted");
          // close thread
          await threadChannel.setArchived(true);
        } catch (e) {
          e = undefined
        }
      }
    }
  }
}

async function checkForAutoDecline(interaction, message, lang) {
  const deny_downvotes = await db.getDeclineDownvotes(interaction.guild.id)

  if (deny_downvotes) {
    const voters = await db.getSuggestionVoters(interaction.guild.id, message.id);
    const downvotes = voters[0]["downvotes"];
    if (downvotes >= deny_downvotes) {
      const embedData = await db.getServerEmbedData(interaction.guild.id);
      let embed = message.embeds[0];
      let editedEmbed = {
        author: embed.author,
        color: embed.color,
        timestamp: embed.timestamp,
        footer: embed.footer,
        description: embed.description,
        fields: [embed.fields[0], embed.fields[1], {
          name: "**" + lang.suggest_declined + `** ${embedData?.denied_emoji || "<a:deny_bot:1000710816980533278>"}`,
          value: lang.suggestion_auto_decline_downvotes,
        }],
      };
      const uicon = embedData?.upvote_emoji || "<:thumbs_up_bot:1080565677900976242>";
      const dicon = embedData?.downvote_emoji || "<:thumbs_down_bot:1080566077504880761>";
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
        ], embeds: [editedEmbed]
      });
      await db.setSuggestionDenied(interaction.guild.id, message.id);
      const thread = await db.getSuggestionThread(interaction.guild.id, message.id);
      if (thread) {
        try {
          // get thread by id
          const threadChannel = await interaction.client.channels.fetch(thread);
          // make thread private
          await threadChannel.setLocked(true, "Suggestion declined");
          // close thread
          await threadChannel.setArchived(true);
        } catch (e) {
          e = undefined
        }
      }
    }
  }
}


/**
 *
 * @param {Discord.interaction} interaction
 */
async function buttons(interaction) {


  // .log(interaction.customId);

  const language = await db.getServerLanguage(interaction.guild?.id)
  const lang = require(`../../botconfig/languages/${language}.json`);
  let edata = await db.getServerEmbedData(interaction.guild?.id);
  let dicon = "<:thumbs_down_bot:1080566077504880761>";
  let ecolor = "2C2F33";
  let uicon = "<:thumbs_up_bot:1080565677900976242>";
  // console.log(edata);
  try {
    if (edata) {
      dicon = edata.downvote_emoji;
      ecolor = edata.suggestion_embed_color;
      uicon = edata.upvote_emoji;
    }
  } catch (e) {
    e = null;
  }


  switch (interaction.customId) {
    case "up": {
      await interaction.deferUpdate().catch(() => {
      });
      let message = interaction.message;
      let embed = message.embeds[0];
      let newNumber = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) + 1;
      let voter = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
      // console.log(voter);
      voter = voter[0];
      if (voter === undefined) return await interaction.followUp({
        content: lang.suggest_none_found,
        ephemeral: true
      });
      // console.log(voter);
      if (voter.toString() === "") {
        //console.log("voter is null");
        voter = {
          upvoters: [], downvoters: [], re_voters: [],
        };
      }
      if (voter["downvoters"].includes(interaction.user.id) || voter["upvoters"].includes(interaction.user.id)) {
        // console.log(!voter["re_voters"].includes(interaction.user.id));
        if (!voter["re_voters"].includes(interaction.user.id)) {
          await confirmRevote(interaction, lang);
          return;
        } else {
          await interaction.followUp({
            content: lang.already_voted_again, ephemeral: true,
          });
          return;
        }
      }
      let editedEmbed = {
        author: embed.author,
        color: embed.color,
        timestamp: embed.timestamp,
        footer: embed.footer,
        description: embed.description,
        fields: [
          {
            name: uicon + " " + lang.suggest_upvotes,
            value: `\`\`\`\n${newNumber}\`\`\``,
            inline: true,
          },
          embed.fields[1],
        ],
      };
      // console.log(interaction.user.id);
      await db.addSuggestionUpvote(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString());
      await message.edit({
        components: message.components,
        embeds: [editedEmbed],
      });
      await checkForAutoAccept(interaction, message, lang);
    }
      break;

    case "down": {
      await interaction.deferUpdate().catch(() => {
      });
      // logger.info(`${interaction.member.user.tag} used ${interaction.commandName}`, "info");
      let message = interaction.message;
      let embed = message.embeds[0];
      let newNumber = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) + 1;
      let voter = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
      // console.log(voter);
      voter = voter[0];
      if (voter === undefined) return await interaction.followUp({
        content: lang.suggest_none_found,
        ephemeral: true
      });
      if (voter.toString() === "") {
        //console.log("voter is null");
        voter = {
          upvoters: [], downvoters: [], re_voters: [],
        };
      }
      if (voter["downvoters"].includes(interaction.user.id) || voter["upvoters"].includes(interaction.user.id)) {
        // console.log(!voter["re_voters"].includes(interaction.user.id));
        if (!voter["re_voters"].includes(interaction.user.id)) {
          await confirmRevote(interaction, lang);
          return;
        } else {
          await interaction.followUp({
            content: lang.already_voted_again, ephemeral: true,
          });
          return;
        }
      }
      let editedEmbed = {
        author: embed.author,
        color: embed.color,
        timestamp: embed.timestamp,
        footer: embed.footer,
        description: embed.description,
        fields: [
          embed.fields[0],
          {
            name: dicon + " " + lang.suggest_downvotes,
            value: `\`\`\`\n${newNumber}\`\`\``,
            inline: true,
          },
        ],
      };
      await db.addSuggestionDownvote(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString());
      await message.edit({
        components: message.components,
        embeds: [editedEmbed],
      });
      await checkForAutoDecline(interaction, message, lang);
    }
      break;

    case "up-rechoice": {
      await interaction.deferUpdate().catch(() => {
      });
      let message = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
      let embed = message.embeds[0];
      let voters = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
      voters = voters[0];
      let newNumber = Number(voters["downvotes"]) - 1;
      let newNumber1 = Number(voters["upvotes"]) + 1;
      if (!voters["re_voters"].includes(interaction.user.id)) {
        if (voters["upvoters"].includes(interaction.user.id)) {
          await interaction.followUp({
            content: lang.already_voted_option, ephemeral: true,
          });
          return;
        } else if (voters["downvoters"].includes(interaction.user.id)) {
          if (await db.addSuggestionDownvoteRevoteUp(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString())) {
            let editedEmbed = {
              author: embed.author,
              color: embed.color,
              timestamp: embed.timestamp,
              footer: embed.footer,
              description: embed.description,
              fields: [{
                name: uicon + " " + lang.suggest_upvotes,
                value: `\`\`\`\n${newNumber1}\`\`\``,
                inline: true,
              }, {
                name: dicon + " " + lang.suggest_downvotes,
                value: `\`\`\`\n${newNumber}\`\`\``,
                inline: true,
              },],
            };
            await message.edit({
              components: message.components,
              embeds: [editedEmbed],
            });
            await interaction.followUp({
              content: lang.revote_success,
              ephemeral: true,
            });
            await checkForAutoAccept(interaction, message, lang);
            return;
          } else {
            await interaction.followUp({
              content: lang.already_voted,
              ephemeral: true,
            });
            return;
          }
        } else {
          await interaction.followUp({
            content: lang.already_voted,
            ephemeral: true,
          });
          return;
        }
      } else {
        await interaction.followUp({
          content: lang.already_voted_again,
          ephemeral: true,
        });
        return;
      }
    }

    case "down-rechoice": {
      await interaction.deferUpdate().catch(() => {
      });
      let message = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
      let embed = message.embeds[0];
      let voters = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
      voters = voters[0];
      let newNumber = Number(voters["downvotes"]) + 1;
      let newNumber1 = Number(voters["upvotes"]) - 1;
      if (!voters["re_voters"].includes(interaction.user.id)) {
        if (voters["downvoters"].includes(interaction.user.id)) {
          await interaction.followUp({
            content: lang.already_voted_option,
            ephemeral: true,
          });
          return;
        } else if (
          voters["upvoters"].includes(interaction.user.id)
        ) {
          if (await db.addSuggestionUpvoteRevoteDown(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString())) {
            let editedEmbed = {
              author: embed.author,
              color: embed.color,
              timestamp: embed.timestamp,
              footer: embed.footer,
              description: embed.description,
              fields: [
                {
                  name: uicon + " " + lang.suggest_upvotes,
                  value: `\`\`\`\n${newNumber1}\`\`\``,
                  inline: true,
                },
                {
                  name: dicon + " " + lang.suggest_downvotes,
                  value: `\`\`\`\n${newNumber}\`\`\``,
                  inline: true,
                },
              ],
            };
            await message.edit({
              components: message.components,
              embeds: [editedEmbed],
            });
            await interaction.followUp({
              content: lang.revote_success,
              ephemeral: true,
            });
            await checkForAutoDecline(interaction, message, lang);
            return;
          } else {
            await interaction.followUp({
              content: lang.already_voted,
              ephemeral: true,
            });
            return;
          }
        } else {
          await interaction.followUp({
            content: lang.already_voted,
            ephemeral: true,
          });
          return;
        }
      } else {
        await interaction.followUp({
          content: lang.already_voted_again,
          ephemeral: true,
        });
        return;
      }
    }

    case "suggest": {
      const modal = new modals.Modal()
        .setCustomId('send')
        .setTitle(lang.add_suggestion_under)
        .addComponents(
          new modals.TextInputComponent()
            .setCustomId('input')
            .setLabel(lang.suggestion_name)
            .setStyle('LONG')
            .setMinLength(3)
            .setMaxLength(1024)
            .setPlaceholder(lang.add_suggestion_here)
            .setRequired(true)
        );

      await modals.showModal(modal, {
        client: interaction.client,
        interaction: interaction
      });
      break;

    }

    case "info": {
      await interaction.deferUpdate().catch(() => {
      });
      let voters = await db.getSuggestionVoters(interaction.guild.id.toString(), interaction.message.id.toString());
      interaction.followUp({content: voters, ephemeral: true});
    }
      break;

    case "accepted": {
      await interaction.deferUpdate().catch(() => {
      });
      await interaction.followUp({
        content: lang.already_accepted,
        ephemeral: true,
      });
    }
      break;

    case "declined": {
      await interaction.deferUpdate().catch(() => {
      });
      await interaction.followUp({
        content: lang.already_declined,
        ephemeral: true,
      });
    }
      break;

    default:
      break;
  }
}

async function modalSubmit(client, modal) {
  if (modal.customId === "send") {
    let modalChannel = modal.channelId;

    let res = modal.fields.getTextInputValue("input");
    let channels = await db.getServerSuggestionChannels(modal.guild?.id);

    if (channels?.length === 0 || channels === undefined) {
      await modal.reply({
        content: "Please set a suggestion channel first!",
        ephemeral: true,
      });
      return;
    } else {
      // check if the modalChannel is in the suggestion channels
      let found = false;
      for (let i = 0; i < channels?.length || 0; i++) {
        if (!channels) break;
        if (channels[i] === modalChannel) {
          found = true;
          break;
        }
      }
      if (!found) {
        // replace with just modalChannel = channels[0]; when legacy support is dropped
        try {
          modalChannel = channels[0];
        } catch (e) {
          return await modal.reply({
            content: "Please ask an adminstrator to reset the suggestion channels!\nThis is due to a big change in the suggestion system which enables multiple suggestion channels.",
            ephemeral: true,
          });
        }
      }
    }
    let channel = modal.guild?.channels.cache.get(modalChannel);
    /*const badlinks = ["https://", "http://", "www."];
    const nitroscam = [
        "free",
        "nitro",
        "steam",
        "airdrop",
        "gift",
        "minecraft",
        "epic",
        "tiktok", // somehow servers with TikTok etc. in their name are still getting advertised
    ];*/
    const serverdata = await db.getAllServerSettings(modal.guild?.id);
    let language;
    try {
      language = serverdata["language"];
    } catch (e) {
      language = "lang_en";
    }
    if (language == null) {
      language = "lang_en";
    }
    const lang = require(`../../botconfig/languages/${language}.json`);

    // too lazy to make this better, sorry
    let dicon;
    let ecolor;
    let uicon;
    try {
      if (serverdata["suggestion_embed_color"] !== null && serverdata["suggestion_embed_color"] !== undefined && serverdata["suggestion_embed_color"] !== "") {
        ecolor = serverdata["suggestion_embed_color"];
      } else {
        ecolor = "2C2F33";
      }
    } catch (e) {
      ecolor = "2C2F33";
    }
    try {
      if (serverdata["upvote_emoji"] !== null && serverdata["upvote_emoji"] !== undefined && serverdata["upvote_emoji"] !== "") {
        uicon = serverdata["upvote_emoji"];
      } else {
        uicon = "👍";
      }
    } catch (e) {
      uicon = "👍";
    }
    try {
      if (serverdata["downvote_emoji"] !== null && serverdata["downvote_emoji"] !== undefined && serverdata["downvote_emoji"] !== "") {
        dicon = serverdata["downvote_emoji"];
      } else {
        dicon = "👎";
      }
    } catch (e) {
      dicon = "👎";
    }

    //Removes bad links | disabled for now since bots don't use modals yet
    /*let allowlinks = await db.getServerAllowsLinks(modal.guild?.id);
    if (badlinks.some((el) => res.includes(el)) === true && allowlinks !== true) {
        modal.reply({content: lang.suggest_badlink, ephemeral: true});
        return;
    }

    //Removes nitro scams
    try {
        if (
            res.match(/\b\w+\b/g).filter((word) => nitroscam.includes(word))
                .length > 1
        ) {
            modal.reply({content: lang.suggest_badlink, ephemeral: true});
            return;
        }
    } catch (error) {
        //logger.error(error);
        modal.reply({content: lang.suggest_badlink, ephemeral: true});
        return;
    }*/

    //Message for channel not being set
    if (!channel)
      return modal.reply({
        content: lang.suggest_channel_not_set,
        ephemeral: true,
      });

    //Sends message to confirm the suggestion
    modal.reply({content: lang.suggest_sent, ephemeral: true});
    let sugMessage = await channel
      .send({
        embeds: [
          {
            author: {
              name: modal.user.username,
              iconURL: modal.user.avatarURL({dynamic: true}),
            },
            color: ecolor,
            timestamp: new Date(),
            footer: {
              iconURL: modal.guild?.iconURL({dynamic: true}),
              text: modal.guild?.name,
            },
            description: res,
            fields: [
              {
                name: uicon + " " + lang.suggest_upvotes,
                value: "```\n0```",
                inline: true,
              },
              {
                name: dicon + " " + lang.suggest_downvotes,
                value: "```\n0```",
                inline: true,
              },
            ],
          },
        ],
        components: [
          new Discord.MessageActionRow().addComponents(
            new Discord.MessageButton()
              .setCustomId("up")
              .setStyle("SUCCESS")
              .setLabel(lang.suggest_upvote)
              .setEmoji(`${uicon}`),
            new Discord.MessageButton()
              .setCustomId("down")
              .setStyle("DANGER")
              .setLabel(lang.suggest_downvote)
              .setEmoji(`${dicon}`)
          ),
        ],
      })
      .then(async (message) => {
        await db.addNewSuggestion(modal.guild?.id, message.id, res, modal.user.id, channel.id);
        return message;
      });

    let thread = await db.getServerAutoThread(modal.guild?.id);
    if (thread == null) return;
    let starterMessage = res.substring(0, 95);
    if (starterMessage.includes(". ")) {
      starterMessage = starterMessage.split(". ")[0];
    }
    if (starterMessage.includes("\n")) {
      starterMessage = starterMessage.split("\n")[0];
    }
    if (starterMessage.length > 95) {
      starterMessage += "...";
    }
    if (thread == true) {
      try {
        let threadChannel = await sugMessage.startThread({
          name: starterMessage,
        });
        await db.setSuggestionThread(sugMessage.id, threadChannel.id);
      } catch (e) {
        e = null;
      }
    }
    let suggestMessageId = await db.getSuggestMessage(channel.id);
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
    let suggestActionRow = new Discord.MessageActionRow().addComponents(
      suggestButton
    );
    // send the embed
    suggestMessage = await channel.send({embeds: [suggestEmbed], components: [suggestActionRow]});
    // set the message id in the database
    await db.setSuggestMessage(channel.id, suggestMessage.id);


  } else if (modal.customId === "edit") {

    const language = await db.getServerLanguage(modal.guild.id)
    const lang = require(`../../botconfig/languages/${language}.json`);

    let channels = await db.getServerSuggestionChannels(modal.guild.id);

    let userID = modal.user.id;

    let givenMessageString = modal.fields.getTextInputValue("message-id");
    let newMessage = modal.fields.getTextInputValue("input");
    let givenMessageID = "";

    if (givenMessageString.includes("/")) {
      givenMessageID = givenMessageString.split("/")[6];
      givenMessageID = givenMessageString.split("/")[6];
    } else {
      givenMessageID = givenMessageString;
    }

    let udata = await db.getAllUserSuggestions(modal.guild.id, userID);
    if (udata == null) return modal.reply(
      {content: lang.suggest_none, ephemeral: true}
    );
    let messageIdArray = udata.map(x => x.message_id);
    if (!messageIdArray.includes(givenMessageID)) return modal.reply(
      {content: lang.suggest_none_found, ephemeral: true}
    );

    let gottenMessage = false;
    let message;
    for (let channel in channels) {
      channel = channels[channel];
      channel = modal?.guild.channels.cache.get(channel);
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
    if (!gottenMessage) return modal.reply(
      {content: lang.suggest_none_found, ephemeral: true}
    );

    if (message === false) return;

    let embed = message.embeds[0];

    if (embed.fields[2] != null) {
      return modal.reply(
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
    modal.reply(
      {content: lang.suggest_edit_success, ephemeral: true}
    );

  }
}