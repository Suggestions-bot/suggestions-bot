const Logger = require('../../../logger')
const db = require('../../../database')
const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js')

module.exports = {
  name: 'add', //the command name for the Slash Command
  description: 'Add a suggestion.  Same as /suggest', //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [],
  run: async (client, interaction) => {
    try {
      const language = await db.getServerLanguage(interaction.guild.id)
      const lang = require(`../../botconfig/languages/${language}.json`)

      const modal = new ModalBuilder()
        .setCustomId('send')
        .setTitle(lang.add_suggestion_under)

      const textInput = new TextInputBuilder()
        .setCustomId('input')
        .setLabel(lang.suggestion_name)
        .setStyle(TextInputStyle.Short)
        .setMinLength(3)
        .setMaxLength(1024)
        .setPlaceholder(lang.add_suggestion_here)
        .setRequired(true)

      modal.addComponents(new ActionRowBuilder().addComponents(textInput))

      await interaction.showModal(modal, {
        client: client,
        interaction: interaction,
      })
    } catch (e) {
      Logger.error(e, e.stack)
    }
  },
}
