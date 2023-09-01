const Logger = require("../../../logger");
const modals = require("discord-modals");
const db = require("../../../database");

module.exports = {
  name: "getuser", //the command name for the Slash Command
  description: "Get suggestions of any user.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {"User": {name: "user", description: "The user you want to get the suggestions from", required: true}},
    // {"String": { name: "message-id", description: "If you don't know the user's name or id.", required: false}},
    {"Integer": {name: "display_amount", description: "The amount of suggestions to display", required: false}},
  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;

      const language = await db.getServerLanguage(interaction.guild.id);
      const lang = require(`../../botconfig/languages/${language}.json`);
      const userInfos = options.getUser("user");
      //console.log(userInfos);
      //const givenMessageString = options.getString("message-id");
      const givenDisplayAmount = options.getInteger("display_amount") || 10;

      if (userInfos != null) {
        await interaction.deferReply();
        let udata = await db.getAllUserSuggestions(interaction.guild.id.toString(), userInfos.id.toString()); // only worts with strings idk why
        //let udata = await db.getAllUserSuggestions("347871491402235914", "100000000000000001");
        //console.log(udata);

        if (udata == null || udata === []) return await interaction.followUp(
          {
            content: "<@" + userInfos.id + "> " + lang.user_has_no_suggestions + " **" + interaction.guild?.name + "**",
            ephemeral: true
          }
        )
        else {
          //let calSugs = await udata.map((message, index) => `**${index + 1}.** [${lang.to_suggestion}](<https://discord.com/channels/${interaction.guild?.id}/${sugChannel}/${message.message_id}>)\n\`\`\`\n${message.content}\n\`\`\``).join("\n\n");
          let calSugs = await udata.slice(Math.max(udata.length - givenDisplayAmount, 0)).reverse().map((message, index) => `**${index + 1}.** [${lang.to_suggestion}](<https://discord.com/channels/${interaction.guild.id}/${message.channel_id}/${message.message_id}>)\n\`\`\`\n${message.content}\n\`\`\``).join("\n\n");

          let sugs = null;
          //console.log(calSugs.length);
          if (calSugs.length > 2000) {
            let splitSugs = calSugs.split("\n\n");
            sugs = [];
            let sugsLength = 0;
            let i = 0;
            for (const sug of splitSugs) {
              if (sugsLength > 1800) {
                i++;
                sugsLength = sug.length;
              } else {
                sugsLength += sug.length;
              }
              if (sugs[i] == null) sugs[i] = "";
              sugs[i] += sug + "\n\n";
            }
          }

          if (sugs) {
            //console.log(sugs[0].length);
            await interaction.followUp(
              {content: sugs[0], ephemeral: false}
            )
            for (const sug of sugs) {
              if (sug === sugs[0]) continue;
              await interaction.followUp(
                {content: sug, ephemeral: false}
              )
              await new Promise(resolve => setTimeout(resolve, 250));
            }
          } else {
            await interaction.followUp(
              {content: calSugs, ephemeral: false}
            )
          }

        }
      }
      /*else if (givenMessageString != null) {
        let givenMessageID = "";

        if (givenMessageString.includes("/")) {
            givenMessageID = givenMessageString.split("/")[6];
        } else {
            givenMessageID = givenMessageString;
        }

        let   ckey         = "SuggestionsChannel_"+interaction.guild.id;
        let   value       = data.fetch(ckey)?.channel
        let   channel   = client.channels.cache.get(value);
        let message = await channel.messages.fetch(givenMessageID.toString())
        .catch(err => {
            interaction.reply(
                {content:lang.suggest_none_found, ephemeral:true}
            )
            return false;
        });

        if (message == false) return;

        let userID = data.fetch(message.id.toString())
        let   userKey   = "Suggestions_"+interaction.guild.id+"_"+message.author.id.toString()+".sugs";
        let    udata    = data.fetch(userKey);

        if (udata == null) return interaction.reply(
            {content:"<@"+message.author.id+"> " + lang.user_has_no_suggestions + "**" + interaction.guild?.name + "**" ,ephemeral:true}
        )
        else {
            let calSugs = await udata.map((message, index) => `${index + 1}. [${lang.to_suggestion}](${message.url})\n\`\`\`\n${message.content}\`\`\``).join("\n\n");
            interaction.reply(
                {content:calSugs,ephemeral:true}
            )
        }
      } else {
        interaction.reply(
            {content:lang.not_valid_option, ephemeral:true}
        )
      }*/
    } catch (e) {
      Logger.error(e, e.stack);
    }
  }
}
