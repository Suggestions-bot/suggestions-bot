const Logger = require("../../../logger");
const db = require("../../../database");

module.exports = {
  name: "auto", //the command name for the Slash Command
  description: "Automatically Accept / Decline a Suggestion", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [

    {
      "Integer": {
        name: "accept_amount",
        description: "The amount of upvotes a suggestion needs to be accepted automatically",
        required: false
      }
    },
    {
      "Integer": {
        name: "decline_amount",
        description: "The amount of downvotes a suggestion needs to be declined automatically",
        required: false
      }
    },
    {
      "StringChoices": {
        name: "reset",
        description: "Don't do any automatic actions.",
        required: false,
        choices: [["Yes", "true"], ["No", "false"]]
      }
    },

  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;

      let accept_amount = options.getInteger("accept_amount");
      let decline_amount = options.getInteger("decline_amount");
      let remove = options.getString("reset");
      let language = await db.getServerLanguage(interaction.guild?.id)
      let lang = require(`../../botconfig/languages/${language}.json`);

      if (accept_amount == null && decline_amount == null && remove == null) {
        interaction.reply(
          {content: lang.choose_valid_option, ephemeral: true}
        )
      }

      if (remove === "true") {
        try {
          await db.setServerAutoAccept(interaction.guild?.id, null)
          await db.setServerAutoDecline(interaction.guild?.id, null)
          interaction.reply(
            {content: lang.reset_auto, ephemeral: true}
          )
        } catch (e) {
          interaction.reply(
            {content: lang.reset_auto_error, ephemeral: true}
          )
        }
      }

      if (accept_amount != null && decline_amount != null) {
        await db.setServerAutoAccept(interaction.guild?.id, accept_amount)
        await db.setServerAutoDecline(interaction.guild?.id, decline_amount)
        interaction.reply({
          content: lang.set_auto_accept.replace(/{amount}/g, accept_amount) + "\n" + lang.set_auto_decline.replace(/{amount}/g, decline_amount),
          ephemeral: true
        });
        accept_amount = null
        decline_amount = null
      }

      if (accept_amount != null) {
        await db.setServerAutoAccept(interaction.guild?.id, accept_amount)
        interaction.reply(
          {content: lang.set_auto_accept.replace(/{amount}/g, accept_amount), ephemeral: true}
        )
      }

      if (decline_amount != null) {
        await db.setServerAutoDecline(interaction.guild?.id, decline_amount)
        interaction.reply(
          {content: lang.set_auto_decline.replace(/{amount}/g, decline_amount), ephemeral: true}
        )
      }

    } catch (e) {
      Logger.error(e, e.stack);
    }
  }
}
