const beautify = require('beautify.log').default;
const bot_name = require('../botconfig/config.json').bot_name;
const db = require("quick.db");

function formatText(text) {
   return text.replace('BOTNAME', bot_name);
}

const data = new db.table("logs")


// Needed because of the way the logger works
// *****************************************
// ==========================================
if (data.fetch("infos") == null) data.set("infos", ["added new key"]);
if (data.fetch("warnings") == null) data.set("warnings", ["added new key"]);
if (data.fetch("errors") == null) data.set("errors", ["added new key"]);
if (data.fetch("commands") == null) data.set("commands", ["added new key"]);
if (data.fetch("guild_joins") == null) data.set("guild_joins", ["added new key"]);
if (data.fetch("guild_leaves") == null) data.set("guild_leaves", ["added new key"]);
// ==========================================
// *****************************************



// beautify is used to colorize console logs (https://github.com/lucasgdb/beautify.log)
// *****************************************
// ==========================================
module.exports = {
   info(text) {
      const cprefix = '{fgGreen}[BOTNAME - INFO] {reset}';
      const lprefix = '[BOTNAME - INFO] ';
      const cformattedText = formatText(cprefix + text)
      const lformattedText = formatText(lprefix + text)
      beautify.log(cformattedText);
      data.push("infos", [lformattedText])
   },

   chunkmessage(text) {
      const cprefix = '{fgBlue}[MODULE - INFO] {reset}{fgMagenta}';
      // const lprefix = '[MODULE - INFO] ';
      const cformattedText = formatText(cprefix + text)
      // const lformattedText = formatText(lprefix + text)
      beautify.log(cformattedText);
      // data.push("infos", [lformattedText])
   },

   warn(text, warn) {
      const cprefix = '{fgYellow}[BOTNAME - WARN] {reset}';
      const lprefix = '[BOTNAME - WARN] ';
      if (warn == null) {
         warn = text
         text = ""
      } 
      const cformattedText = formatText(`${cprefix + text}\n{fgYellow}[WARN MESSAGE]: {reset}${warn}`)
      const lformattedText = formatText(`${lprefix + text}\n${warn}`)
      beautify.log(cformattedText);
      data.push("warnings", [lformattedText])
   },

   error(text, err) {
      const cprefix = '{fgRed}[BOTNAME - ERROR] {reset}';
      const lprefix = '[BOTNAME - ERROR] ';
      if (err == "") {
         err = "No error-message provided"
      }
      if (err == null) {
         err = text
         text = ""
      } 
      const cformattedText = formatText(`${cprefix + text}\n{fgRed}[ERROR MESSAGE]: {bright}${err}`)
      const lformattedText = formatText(`${lprefix + text}\n${err}`)
      beautify.log(cformattedText);
      data.push("errors", [lformattedText])
   },

   super_error(text, err) {
      const cprefix = '{fgRed}{bright}[BOTNAME - SUPER ERROR] {bright}';
      const lprefix = '[BOTNAME - SUPER ERROR] ';
      const cformattedText = formatText(`${cprefix + text}\n${err}`)
      const lformattedText = formatText(`${lprefix + text}\n${err}`)
      beautify.log(cformattedText);
      data.push("errors", [lformattedText])
   },

   command(ctx) {
      if (commands) {
         const cprefix = '{fgMagenta}[BOTNAME - COMMAND] {reset}';
         const lprefix = '[BOTNAME - COMMAND] ';
         // eslint-disable-next-line max-len
         const cformattedText = formatText(`${cprefix + `${ctx.author.tag} (${ctx.author.id}) used the command ${ctx.command.name} in ${ctx.guild.name} (${ctx.guild.id}) in channel ${ctx.channel.name} (${ctx.channel.id})`}`)
         const lformattedText = formatText(`${lprefix + `${ctx.author.tag} (${ctx.author.id}) used the command ${ctx.command.name} in ${ctx.guild.name} (${ctx.guild.id}) in channel ${ctx.channel.name} (${ctx.channel.id})`}`)
         beautify.log(cformattedText);
         data.push("commands", [lformattedText])
      }
   },

   guildJoin(guild) {
      if (guildJoin) {
         const cprefix = '{fgCyan}[BOTNAME - GUILD JOIN] {reset}';
         const lprefix = '[BOTNAME - GUILD JOIN] ';
         const cformattedText = formatText(`${cprefix}Joined (${guild.name}) (${guild.id}), members: ${guild.memberCount}`)
         const lformattedText = formatText(`${lprefix}Joined (${guild.name}) (${guild.id}), members: ${guild.memberCount}`)
         beautify.log(cformattedText);
         data.push("guild_joins", [lformattedText])
      }
   },

   guildLeave(guild) {
      if (guildLeave) {
         const cprefix = '{fgYellow}[BOTNAME - GUILD LEAVE] {reset}';
         const lprefix = '[BOTNAME - GUILD LEAVE] ';
         const cformattedText = formatText(`${cprefix}Left (${guild.name}) (${guild.id}), members: ${guild.memberCount}`)
         const lformattedText = formatText(`${lprefix}Left (${guild.name}) (${guild.id}), members: ${guild.memberCount}`)
         beautify.log(cformattedText);
         data.push("guild_leaves", [lformattedText])
      }
   },
};
// ==========================================
// *****************************************
