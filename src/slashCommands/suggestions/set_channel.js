const Logger = require("../../handlers/logger");
const db      = require("quick.db");
const data    = new db.table("suggestion_def")
module.exports = {
  name: "set_channel", //the command name for the Slash Command
  description: "Set the suggestions channel.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60) 
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [

		{"Channel": { name: "channel", description: "The channel to send / recieve suggestions in.", required: true }},

  ],
  run: async (client, interaction) => {
    try{
		const {options} = interaction; 

		let channel = options.getChannel("channel").id;
    let  value   = {channel:channel}
    let   key   = "SuggestionsChannel_"+interaction.guild?.id;
    data.set(key, value)

    language = data.get("Language_"+interaction.guild?.id)
    if (language == null) {
        language = "lang_en"
    }
    const lang = require(`../../botconfig/languages/${language}.json`);

    interaction.reply(
      {content:lang.set_suggestion_channel + " <#"+channel+">.",ephemeral:true}
    )
    } catch (e) {
        Logger.error(e);
    }
  }
}
