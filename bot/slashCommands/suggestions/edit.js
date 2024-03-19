const Logger = require('../../../logger')
const db = require('../../../database')
const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')

module.exports = {
  name: 'edit', //the command name for the Slash Command
  description: 'Edit your suggestion.', //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      String: {
        name: 'message-id',
        description: 'The message ID of the message you want to edit.',
        required: false,
      },
    },
  ],
  run: async (client, interaction) => {
    try {
      const { options } = interaction

      const language = await db.getServerLanguage(interaction.guild.id)
      const lang = require(`../../botconfig/languages/${language}.json`)

      let givenMessageString = options.getString('message-id')
      if (givenMessageString) {
        let channels = await db.getServerSuggestionChannels(
          interaction.guild.id
        )
        let userID = interaction.user.id
        let udata = await db.getAllUserSuggestions(interaction.guild.id, userID)

        if (udata == null)
          return interaction.reply({
            content: lang.suggest_none,
            ephemeral: true,
          })

        //console.log(udata);
        let messageIdArray = udata.map((x) => x.message_id)

        let givenMessageID = ''

        if (givenMessageString.includes('/')) {
          givenMessageID = givenMessageString.split('/')[6]
        } else {
          givenMessageID = givenMessageString
        }

        if (!messageIdArray.includes(givenMessageID))
          return interaction.reply({
            content: lang.suggest_none_found,
            ephemeral: true,
          })

        let gottenMessage = false
        let message
        for (let channel in channels) {
          channel = channels[channel]
          channel = interaction?.guild.channels.cache.get(channel)
          if (!channel) continue
          try {
            message = await channel.messages.fetch(givenMessageID.toString())
          } catch (e) {
            message = false
          }
          if (message) {
            gottenMessage = true
            break
          }
        }
        if (!gottenMessage)
          return interaction.reply({
            content: lang.suggest_none_found,
            ephemeral: true,
          })

        if (message !== false) {
          // content is the suggestion
          const content = message.embeds[0].description
          // create a modal
          const modal = new ModalBuilder()
            .setCustomId('edit')
            .setTitle(lang.suggest_edit_title)

          // add components to modal
          const messageID = new TextInputBuilder()
            .setCustomId('message-id')
            .setLabel(lang.suggest_edit_message_id)
            .setStyle(TextInputStyle.Short)
            .setMinLength(10)
            .setMaxLength(256)
            .setValue(givenMessageID.toString())
            .setRequired(true)

          const input = new TextInputBuilder()
            .setCustomId('input')
            .setLabel(lang.suggestion_name)
            .setPlaceholder(lang.add_suggestion_here)
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(3)
            .setMaxLength(1024)
            .setRequired(true)

          modal.addComponents(
            new ActionRowBuilder().addComponents(messageID),
            new ActionRowBuilder().addComponents(input)
          )

          // show the modal

          await interaction.showModal(modal, {
            client: client,
            interaction: interaction,
          })
        }
      } else {
        // create a modal
        const modal = new ModalBuilder()
          .setCustomId('edit')
          .setTitle(lang.suggest_edit_title)

        // add components to modal
        const messageID = new TextInputBuilder()
          .setCustomId('message-id')
          .setLabel(lang.suggest_edit_message_id)
          .setStyle(TextInputStyle.Short)
          .setMinLength(10)
          .setMaxLength(256)
          .setRequired(true)

        const input = new TextInputBuilder()
          .setCustomId('input')
          .setLabel(lang.suggestion_name)
          .setPlaceholder(lang.add_suggestion_here)
          .setStyle(TextInputStyle.Paragraph)
          .setMinLength(3)
          .setMaxLength(1024)
          .setRequired(true)

        modal.addComponents(
          new ActionRowBuilder().addComponents(messageID),
          new ActionRowBuilder().addComponents(input)
        )

        // show the modal
        await interaction.showModal(modal, {
          client: client,
          interaction: interaction,
        })
      }
    } catch (e) {
      Logger.error(e, e.stack)
    }
  },
}
