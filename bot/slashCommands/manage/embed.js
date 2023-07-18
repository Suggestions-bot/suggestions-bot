const Logger = require("../../../logger");
const db = require("../../../database");

module.exports = {
  name: "embed", //the command name for the Slash Command
  description: "Change the looks of the embed. Execute with no options to reset.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {
      "String": {
        name: "color",
        description: "The color you want the embed to be. (has to be hex e.g. #2c2f33)",
        required: false
      }
    },
    {"String": {name: "icon_up", description: "The default is 👍", required: false}},
    {"String": {name: "icon_down", description: "The default is 👎", required: false}},
    {"String": {name: "icon_accepted", description: "The default is a checkmark", required: false}},
    {"String": {name: "icon_declined", description: "The default is a cross", required: false}},
  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;
      const language = await db.getServerLanguage(interaction.guild?.id)
      const lang = require(`../../botconfig/languages/${language}.json`);

      let gcolor = options.getString("color");
      if (gcolor != null) {
        if (gcolor.includes("#")) {
          gcolor = gcolor.replace("#", "")
        }
        if (gcolor.length !== 6) {
          interaction.reply(
            {content: lang.embed_invalid_color, ephemeral: true}
          )
          return
        }
        gcolor = "0x" + gcolor.toLowerCase()
      } else {
        gcolor = "0x2c2f33"
      }

      let dicon = options.getString("icon_down");
      if (dicon != null) {
        if (dicon.includes(" ")) {
          dicon = dicon.replace(" ", "")
        }
      } else {
        dicon = "👎"
      }

      let uicon = options.getString("icon_up");
      if (uicon != null) {
        if (uicon.includes(" ")) {
          uicon = uicon.replace(" ", "")
        }
      } else {
        uicon = "👍"
      }

      let aicon = options.getString("icon_accepted");
      if (aicon != null) {
        if (aicon.includes(" ")) {
          aicon = aicon.replace(" ", "")
        }
      } else {
        aicon = "<a:accept_bot:1000710815562866759>"
      }

      let ricon = options.getString("icon_declined");
      if (ricon != null) {
        if (ricon.includes(" ")) {
          ricon = ricon.replace(" ", "")
        }
      } else {
        ricon = "<a:deny_bot:1000710816980533278>"
      }


      await db.setServerEmbedSettings(interaction.guild?.id, gcolor, dicon, uicon, aicon, ricon)

      interaction.reply(
        {content: lang.embed_success, ephemeral: true}
      )


    } catch (e) {
      Logger.error(e);
    }
  }
}
