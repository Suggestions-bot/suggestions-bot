const Logger = require("../../handlers/logger");
const db      = require("quick.db");
const data    = new db.table("suggestion_def")
module.exports = {
  name: "channel", //the command name for the Slash Command
  description: "Manage the suggestions channel.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60) 
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [

		{"Channel": { name: "channel", description: "Set the channel to send / recieve suggestions in.", required: true }},
    {"StringChoices": { name: "remove", description: "Remove the existing suggestion channel?", required: false, choices: [["Yes", "true"], ["No", "false"]]}},

  ],
  run: async (client, interaction) => {
    try{
		const {options} = interaction; 

		let channel = options.getChannel("channel").id;
    let remove = options.getString("remove");
    let  value   = {channel:channel}
    let   key   = "SuggestionsChannel_"+interaction.guild?.id;

    if (remove == "true") {
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
    } else {
      data.set(key, value)
      language = data.get("Language_"+interaction.guild?.id)
      if (language == null) {
          language = "lang_en"
      }
      const lang = require(`../../botconfig/languages/${language}.json`);

      interaction.reply(
        {content:lang.set_suggestion_channel + " <#"+channel+">.",ephemeral:true}
      )
    }
    } catch (e) {
        Logger.error(e);
    }
  }
}
