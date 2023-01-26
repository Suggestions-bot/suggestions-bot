const Logger = require("../../handlers/logger");
const modals  = require("discord-modals");
const db      = require("../../handlers/database");

module.exports = {
  name: "embed", //the command name for the Slash Command
  description: "Change the looks of the embed.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60) 
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {"String": { name: "color", description: "The color you want the embed to be. (has to be hex e.g. #2c2f33)", required: true}}, 
    {"String": { name: "icon_down", description: "The default is 👎", required: true}}, 
    {"String": { name: "icon_up", description: "The default is 👍", required: true}}, 
  ],
  run: async (client, interaction) => {
    try{
        const {options} = interaction; 

        language = data.get("Language_"+interaction.guild?.id)
        if (language == null) {
            language = "lang_en"
        }
        const lang = require(`../../botconfig/languages/${language}.json`);

        let gcolor = options.getString("color");
        if (gcolor != null) {
            if (gcolor.includes("#")) {
                gcolor = gcolor.replace("#", "")
            }
            if (gcolor.length != 6) {
                interaction.reply(
                    {content:lang.embed_invalid_color,ephemeral:true}
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

        let key = "CustomEmbed_"+interaction.guild?.id;
        let edataConstructor = {color: gcolor, dicon: dicon, uicon: uicon}
        await data.set(key, edataConstructor);

        interaction.reply(
            {content:lang.embed_success,ephemeral:true}
        )


    } catch (e) {
        Logger.error(e);
    }
  }
}
