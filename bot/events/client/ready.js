//here the event starts
const { change_status } = require('../../handlers/functions')
const Logger = require('../../../logger')
module.exports = (client) => {
  //SETTING ALL GUILD DATA FOR THE DJ ONLY COMMANDS for the DEFAULT
  //client.guilds.cache.forEach(guild=>client.settings.set(guild.id, ["autoplay", "clearqueue", "forward", "loop", "jump", "loopqueue", "loopsong", "move", "pause", "resume", "removetrack", "removedupe", "restart", "rewind", "seek", "shuffle", "skip", "stop", "volume"], "djonlycmds"))
  try {
    try {
      const stringlength = 69
      Logger.chunkmessage('')
      Logger.chunkmessage(
        `     ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓`
      )
      Logger.chunkmessage(
        `     ┃ ` + ' '.repeat(-1 + stringlength - ` ┃ `.length) + '┃'
      )
      Logger.chunkmessage(
        `     ┃ ` +
          `Discord Bot is logged in!` +
          ' '.repeat(
            -1 +
              stringlength -
              ` ┃ `.length -
              `Discord Bot is logged in!`.length
          ) +
          '┃'
      )
      Logger.chunkmessage(
        `     ┃ ` +
          `Botname: ${client.user.tag}` +
          ' '.repeat(
            -1 +
              stringlength -
              ` ┃ `.length -
              `Botname: ${client.user.tag}`.length
          ) +
          '┃'
      )
      // Logger.chunkmessage(`     ┃ `+ `BotID: ${client.user.id}`+ " ".repeat(-1+stringlength-` ┃ `.length-`BotID: ${client.user.id}`.length)+ "┃") // noone needs this lmao
      // Logger.chunkmessage(`     ┃ `+ `Prefix: ${config.prefix}`+ " ".repeat(-1+stringlength-` ┃ `.length-`Prefix: ${config.prefix}`.length)+ "┃") // Not Defined
      // Logger.chunkmessage(`     ┃ `+ `Commands: ${client.commands.size}`+ " ".repeat(-1+stringlength-` ┃ `.length-`Commands: ${client.commands.size}`.length)+ "┃") // Shown in the message after the bot is ready
      Logger.chunkmessage(
        `     ┃ ` +
          `Guilds: ${client.guilds.cache.size}` +
          ' '.repeat(
            -1 +
              stringlength -
              ` ┃ `.length -
              `Guilds: ${client.guilds.cache.size}`.length
          ) +
          '┃'
      )
      Logger.chunkmessage(
        `     ┃ ` +
          `Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}` +
          ' '.repeat(
            -1 +
              stringlength -
              ` ┃ `.length -
              `Users: ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)}`
                .length
          ) +
          '┃'
      )
      Logger.chunkmessage(
        `     ┃ ` + ' '.repeat(-1 + stringlength - ` ┃ `.length) + '┃'
      )
      Logger.chunkmessage(
        `     ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`
      )
      Logger.chunkmessage('')
    } catch {
      Logger.error('Error printing startup message')
    }
    change_status(client)
    //loop through the status per each 10 minutes
    /*setInterval(()=>{
      change_status(client);
    }, 15 * 1000);
    */
    // No Need since there is only one status
  } catch (e) {
    Logger.error(`Error in ready event.`, `${e}`)
  }
}
