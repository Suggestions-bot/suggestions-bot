const Logger = require("../../handlers/logger");
const db      = require("quick.db");
const { lang } = require("moment");
const data    = new db.table("suggestion_def")
module.exports = {
  name: "remove_channel", //the command name for the Slash Command
  description: "Remove the already set suggestions channel.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60) 
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [],
  run: async (client, interaction) => {
    try{

        language = data.get("Language_"+interaction.guild?.id)
        if (language == null) {
            language = "lang_en"
        }
        const lang = require(`../../botconfig/languages/${language}.json`);

        try{
            let   key   = "SuggestionsChannel_"+interaction.guild?.id;

            data.delete(key)
            interaction.reply(
                {content:lang.reset_suggestion_channel ,ephemeral:true}
            )
        } catch (e) {
            interaction.reply(
                {content:lang.reset_suggestion_channel_error,ephemeral:true}
            )
        }
    } catch (e) {
        Logger.error(e);
    }
  }
}
