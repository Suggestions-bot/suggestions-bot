const Logger = require("../../handlers/logger");
const modals  = require("discord-modals");
const db      = require("quick.db");
const data    = new db.table("suggestion_def")
module.exports = {
  name: "get_user", //the command name for the Slash Command
  description: "Get suggestions of any user.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60) 
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {"User": { name: "user", description: "The user you want to get the suggestions from.", required: true }}, 
  ],
  run: async (client, interaction) => {
    try{
        const {options} = interaction; 

        language = data.get("Language_"+interaction.guild?.id)
        if (language == null) {
            language = "lang_en"
        }
        const lang = require(`../../botconfig/languages/${language}.json`);

        let  userInfos  = options.getUser("user");
        let   userKey   = "Suggestions_"+interaction.guild.id+"_"+userInfos.id.toString()+".sugs";
        let    udata    = data.fetch(userKey);

        if (udata == null) return interaction.reply(
            {content:"<@"+userInfos.id+"> " + lang.user_has_no_suggestions + "**" + +interaction.guild?.name + "**" ,ephemeral:true}
        )
        else {
            let calSugs = await udata.map((message, index) => `${index + 1}. [${lang.to_suggestion}](${message.url})\n\`\`\`\n${message.content}\`\`\``).join("\n\n");
            interaction.reply(
                {content:calSugs,ephemeral:true}
            )
        }
    } catch (e) {
        Logger.error(e);
    }
  }
}
