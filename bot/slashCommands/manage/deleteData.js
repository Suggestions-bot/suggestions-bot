const Logger = require('../../../logger')
const db = require('../../../database')

module.exports = {
  name: 'deleteeverything', //the command name for the Slash Command
  description: 'Deletes all of the data the Bot has about the Server.', //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ['manage_server'], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [],
  run: async (client, interaction) => {
    try {
      if (interaction.member.permissions.has('ADMINISTRATOR')) {
        await interaction.deferReply({
          ephemeral: false,
        })

        const randomNumber = Math.floor(Math.random() * 100) + 1
        await interaction.followUp({
          content: `Please reply to this message (mention turned on) with the following Number: ${randomNumber}`,
          ephemeral: false,
        })

        const filter = (m) => m.author.id === interaction.user.id
        const collected = await interaction.channel.awaitMessages({
          filter,
          max: 1,
          time: 10000,
          errors: ['time'],
        })

        if (collected.first().content !== randomNumber.toString()) {
          await collected.first().reply({
            content:
              "You did not repeat the correct Number. Didn't delete anything.",
            ephemeral: false,
          })
        } else {
          await collected.first().reply({
            content:
              'You repeated the correct Number.\nDo you really want to delete **EVERYTHING**?\nThis cannot be undone.\n\nPlease type `Yes I am sure!` to confirm.',
            ephemeral: false,
          })

          const filter = (m) => m.author.id === interaction.user.id
          const collected = await interaction.channel.awaitMessages({
            filter,
            max: 1,
            time: 10000,
            errors: ['time'],
          })

          if (collected.first().content !== 'Yes I am sure!') {
            await interaction.followUp({
              content: "Ok. Didn't delete anything.",
              ephemeral: false,
            })
          } else {
            await interaction.followUp({
              content: 'Ok. Deleting everything...',
              ephemeral: false,
            })

            await new Promise((r) => setTimeout(r, 3000))
            await db.deleteServer(interaction.guild?.id || 0)
            await db.deleteSuggestions(interaction.guild?.id || 0)
            await db.deleteSuggestMessageIDs(interaction.guild?.id || 0)

            await interaction.followUp({
              content: 'Done. Everything is deleted.',
              ephemeral: false,
            })
          }
        }
      } else {
        await interaction.reply({
          content: 'You need to be an Administrator to use this Command.',
          ephemeral: false,
        })
      }
    } catch (e) {
      Logger.error(e, e.stack)
    }
  },
}
