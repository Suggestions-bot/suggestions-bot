const Logger = require("../../../logger");
const db = require("../../../database");
const discord = require("discord.js");

module.exports = {
  name: "info",
  description: "Gets info about the bot",
  cooldown: 5,
  memberpermissions: [],
  requiredroles: [],
  alloweduserids: [],
  options: [],
  run: async (client, interaction) => {
    try {
      const guildAmount = client.guilds.cache.size;
      const userAmount = client.guilds.cache.reduce((a, g) => a + g.memberCount, 0);
      const usersInCache = client.users.cache.size;
      const channelAmount = client.channels.cache.size;
      const uptime = client.uptime;
      const ping = client.ws.ping;

      // get git commit version
      const {execSync} = require('child_process');
      const gitCommit = execSync('git rev-parse --short HEAD').toString().trim();


      const suggestionsInDB = await db.getNumberOfSuggestions();
      let guildsWithMostSuggestions = await db.getGuildsWithMostSuggestions();
      //console.log(guildsWithMostSuggestions);
      let guilds = [];
      for (let i = 0; i < guildsWithMostSuggestions.length; i++) {
        let place = i + 1;
        let guild = {
          place: place,
          guildId: guildsWithMostSuggestions[i]["server_id"],
          numberOfSuggestions: guildsWithMostSuggestions[i]["COUNT(*)"]
        }
        guilds.push(guild);
      }
      guildsWithMostSuggestions = guilds;

      /*console.log("GuildAmount");
      console.log(guildAmount);
      console.log("UserAmount");
      console.log(userAmount);
      console.log("UsersInCache");
      console.log(usersInCache);
      console.log("ChannelAmount");
      console.log(channelAmount);
      console.log("Uptime");
      console.log(uptime);
      console.log("Ping");
      console.log(ping);
      console.log("GitCommit");
      console.log(gitCommit);
      console.log("SuggestionsInDB");
      console.log(suggestionsInDB);
      console.log("GuildsWithMostSuggestions");
      console.log(guildsWithMostSuggestions);*/

      const formattedGuildsWithMostSuggestions = "" +
        "1. " + `${client.guilds.cache.get(guildsWithMostSuggestions[0].guildId)?.name || "Unknown Guild"}` + ` (\`${guildsWithMostSuggestions[0].guildId}\`)` + " - " + guildsWithMostSuggestions[0].numberOfSuggestions + " suggestions\n" +
        "2. " + `${client.guilds.cache.get(guildsWithMostSuggestions[1].guildId)?.name || "Unknown Guild"}` + ` (\`${guildsWithMostSuggestions[1].guildId}\`)` + " - " + guildsWithMostSuggestions[1].numberOfSuggestions + " suggestions\n" +
        "3. " + `${client.guilds.cache.get(guildsWithMostSuggestions[2]?.guildId)?.name || "Unknown Guild"}` + ` (\`${guildsWithMostSuggestions[2]?.guildId}\`)` + " - " + guildsWithMostSuggestions[2]?.numberOfSuggestions + " suggestions";
      //console.log(formattedGuildsWithMostSuggestions);

      const formattedUptime = `${Math.floor(uptime / 86400000)}d ${Math.floor(uptime / 3600000) % 24}h ${Math.floor(uptime / 60000) % 60}m ${Math.floor(uptime / 1000) % 60}s`;
      //console.log(formattedUptime);

      /*const embed = new discord.MessageEmbed()
          .setTitle("Info")
          .setDescription("Stats about the bot")
          .addField("Guilds", guildAmount.toString(), true)
          .addField("Users", userAmount.toString(), true)
          .addField("Users in Cache", usersInCache.toString(), true)
          .addField("Channels", channelAmount.toString(), true)
          .addField("Uptime", formattedUptime, true)
          .addField("Ping", `${ping}ms`, true)
          .addField("Current Version", gitCommit, true)
          .addField("Total Suggestions", suggestionsInDB.toString(), true)
          .addField("Top 3 Guilds with most suggestions", formattedGuildsWithMostSuggestions, false)
          .setColor("GREEN")
          .setTimestamp()
          .setFooter({
              text: "Suggestions Bot",
          });*/


      const embed = new discord.MessageEmbed()
        .setTitle("Info")
        .setDescription("Stats about the bot")
        .addFields(
          {name: "Guilds", value: guildAmount.toString(), inline: true},
          {name: "Users", value: userAmount.toString(), inline: true},
          {name: "Users in Cache", value: usersInCache.toString(), inline: true},
          {name: "Channels", value: channelAmount.toString(), inline: true},
          {name: "Uptime", value: formattedUptime, inline: true},
          {name: "Ping", value: `${ping}ms`, inline: true},
          {name: "Current Version", value: gitCommit, inline: true},
          {name: "Total Suggestions", value: suggestionsInDB.toString(), inline: true},
          {
            name: "Top 3 Guilds with most suggestions",
            value: formattedGuildsWithMostSuggestions,
            inline: false
          }
        )
        .setColor("GREEN")
        .setTimestamp()
        .setFooter({
          text: "Suggestions Bot",
        });

      //console.log(embed);

      await interaction.reply({
        embeds: [embed],
      });

    } catch (e) {
      Logger.error(e);
      console.trace(e);
    }
  }
}
