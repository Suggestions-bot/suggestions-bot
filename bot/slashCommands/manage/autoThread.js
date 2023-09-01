const Logger = require("../../../logger");
const db = require("../../../database");

module.exports = {
  name: "thread", //the command name for the Slash Command
  description: "Automatically create a thread when a suggestion is created", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "StringChoices": {
        name: "value",
        description: "Automatically create a thread when a suggestion is created?",
        required: true,
        choices: [["Yes", "true"], ["No", "false"]]
      }
    },

  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;

      let value = options.getString("value");
      let language = await db.getServerLanguage(interaction.guild?.id || 0)

      if (language == null) {
        language = "lang_en"
      }

      const lang = require(`../../botconfig/languages/${language}.json`);

      if (value === "true") {
        value = true
      } else if (value === "false") {
        value = false
      }

      try {
        await db.setServerAutoThread(interaction.guild?.id || 0, value)
        interaction.reply(
          {content: lang.auto_thread_set.replace("{value}", value.toString()), ephemeral: true}
        )
      } catch (e) {
        interaction.reply(
          {content: lang.auto_thread_error, ephemeral: true}
        )
      }
    } catch (e) {
      Logger.error(e, e.stack);
    }
  }
}
