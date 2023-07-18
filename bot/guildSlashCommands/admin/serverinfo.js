const Logger = require("../../../logger");
const db = require("../../../database");
const discord = require("discord.js");
const {execSync} = require("child_process");
const {join} = require("path");
const {readdirSync} = require("fs");

module.exports = {
  name: "serverinfo",
  description: "Show me the logs!",
  cooldown: 5,
  memberpermissions: [],
  requiredroles: [],
  alloweduserids: [],
  options: [{"String": {name: "guild", description: "Guild ID", required: true}},],
  run: async (client, interaction) => {
    try {
      const guildId = interaction.options.getString("guild");
      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        await interaction.reply({content: "This guild does not exist.", ephemeral: true});
      } else {
        // get all infos that are obtainable
        const guildName = guild.name;
        const guildId = guild.id;
        const guildOwner = guild.ownerId;
        const guildMemberCount = guild.memberCount;
        const guildSuggestionCount = await db.getNumberOfSuggestionsInGuild(guildId);
        // get invite from discord api
        let guildInvite;
        if (guild.vanityURLCode) {
          guildInvite = `https://discord.gg/${guild.vanityURLCode}`;
        } else {
          guildInvite = await guild.invites.fetch().then(invites => {
            return invites.first();
          });
        }
        // if no invite is found, create one
        if (!guildInvite) {
          try {
            guildInvite = await guild.channels.cache.filter(channel => channel.type === "GUILD_TEXT").first().createInvite({unique: true});
          } catch (e) {
            guildInvite = "none";
          }
        }

        // embed
        let embed = new discord.MessageEmbed()
          .setTitle(`Guild ${guildName}`)
          .setDescription(`GuildId: \`${guildId}\`\nOwner: <@${guildOwner}>\nMemberCount: \`${guildMemberCount}\`\nSuggestionCount: \`${guildSuggestionCount}\`\nInvite: ${guildInvite || "none"}`)
          .setColor("BLUE")
          .setFooter({
            text: "SuggestionBot",
            icon_url: client.user.avatarURL()
          })
          .setTimestamp();


        const guildObject = JSON.stringify(guild).replace(/"/g, "\\\"");
        //console.log(guildObject);
        const post = execSync(`curl -s -d --url https://wastebin.zip/documents --header "content-type: text/plain" --data "${guildObject}"`).toString();
        const key = JSON.parse(post).key;
        embed.addFields({
          name: "Guild Object",
          value: `https://wastebin.zip/raw/${key}`
        });
        await interaction.reply({embeds: [embed]});

      }

    } catch (e) {
      Logger.error(e);
    }
  }
}
