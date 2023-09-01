const Logger = require("../../../logger");
const modals = require("discord-modals");
const db = require("../../../database");

module.exports = {
  name: "getupvoted", //the command name for the Slash Command
  description: "Gets the top X most upvoted suggestions that have not been accepted/declined.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60)
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {"Integer": {name: "display_amount", description: "The amount of suggestions to display", required: true}},
    {
      "StringChoices": {
        name: "ephemeral",
        description: "Ephemeral?",
        required: false,
        choices: [["Yes", "true"], ["No", "false"]]
      }
    },
  ],
  run: async (client, interaction) => {
    try {
      const {options} = interaction;

      const language = await db.getServerLanguage(interaction.guild.id);
      const lang = require(`../../botconfig/languages/${language}.json`);
      //console.log(userInfos);
      //const givenMessageString = options.getString("message-id");
      const givenDisplayAmount = options.getInteger("display_amount") || 10;
      let sendEphemeral = options.getString("ephemeral") || "false";
      sendEphemeral = sendEphemeral === "true";

      await interaction.deferReply({ephemeral: sendEphemeral});
      let udata = await db.getServerSuggestionsSortedByUpvotes(interaction.guild.id.toString(), givenDisplayAmount); // only worts with strings idk why
      //let udata = await db.getAllUserSuggestions("347871491402235914", "100000000000000001");
      //console.log(udata);

      if (udata == null || udata === []) {
        return await interaction.followUp(
          {
            content: "...",
            ephemeral: true
          }
        )
      } else {
        let calSugs = "";

        //console.log(udata);

        for (const sug of udata) {
          // format: [suggestion content] [suggestion upvotes] [suggestion downvotes] [link to suggestion]
          let formattedSug = `\`\`\`\n${sug["content"]}\n\`\`\`\nUpvotes: \`${sug["upvotes"]}\`\nDownvotes: \`${sug["downvotes"]}\`\n[${lang.to_suggestion}](https://discord.com/channels/${interaction.guild.id}/${sug["channel_id"]}/${sug["message_id"]})`;
          calSugs += formattedSug + "\n\n\n";

        }


        let sugs = null;
        //console.log(calSugs.length);
        if (calSugs.length > 2000) {
          let splitSugs = calSugs.split("\n\n\n");
          sugs = [];
          let sugsLength = 0;
          let i = 0;
          for (const sug of splitSugs) {
            if (sugsLength > 1000) {
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
          await interaction.followUp(
            {content: sugs[0], ephemeral: sendEphemeral}
          )
          for (const sug of sugs) {
            if (sug === sugs[0]) continue;
            await interaction.followUp(
              {content: sug, ephemeral: sendEphemeral}
            )
            await new Promise(resolve => setTimeout(resolve, 250));
          }
        } else {
          await interaction.followUp(
            {content: calSugs, ephemeral: sendEphemeral}
          )
        }
      }
    } catch (e) {
      Logger.error(e, e.stack);
    }
  }
}
