//here the event starts
const config = require("../../botconfig/config.json")
const { change_status } = require("../../handlers/functions");
const Logger = require("../../handlers/logger");
module.exports = client => {
  //SETTING ALL GUILD DATA FOR THE DJ ONLY COMMANDS for the DEFAULT
  //client.guilds.cache.forEach(guild=>client.settings.set(guild.id, ["autoplay", "clearqueue", "forward", "loop", "jump", "loopqueue", "loopsong", "move", "pause", "resume", "removetrack", "removedupe", "restart", "rewind", "seek", "shuffle", "skip", "stop", "volume"], "djonlycmds"))
  try{
    try{
      const stringlength = 69;
      Logger.chunkmessage("")
      Logger.chunkmessage(`     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`)
      Logger.chunkmessage(`     ┃ `+ " ".repeat(-1+stringlength-` ┃ `.length)+ "┃")
      Logger.chunkmessage(`     ┃ `+ `Discord Bot is online!`+ " ".repeat(-1+stringlength-` ┃ `.length-`Discord Bot is online!`.length)+ "┃")
      Logger.chunkmessage(`     ┃ `+ `Botname: ${client.user.tag}`+ " ".repeat(-1+stringlength-` ┃ `.length-`Botname: ${client.user.tag}`.length)+ "┃")
      Logger.chunkmessage(`     ┃ `+ " ".repeat(-1+stringlength-` ┃ `.length)+ "┃")
      Logger.chunkmessage(`     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`)
      Logger.chunkmessage("")
    }catch{Logger.error("Error printing startup message")}
    change_status(client);
    //loop through the status per each 10 minutes
    setInterval(()=>{
      change_status(client);
    }, 15 * 1000);
  
  } catch (e){
    Logger.error(`Error in ready event.`, `${e}`);
  }
}
