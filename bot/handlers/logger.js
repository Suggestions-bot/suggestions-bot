const beautify = require('beautify.log').default;

function formatText(text) {
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString();
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  const formattedDate = `${day}.${month}.${year} ${hour}:${minute}:${second}`;

  return text.replace('TIMESTAMP', formattedDate);
}



// beautify is used to colorize console logs (https://github.com/lucasgdb/beautify.log)
// *****************************************
// ==========================================
module.exports = {
    info(text) {
        const cprefix = '[TIMESTAMP] {fgGreen}[INFO] {reset}';
        const cformattedText = formatText(cprefix + text)
        beautify.log(cformattedText);
    },

    chunkmessage(text) {
        const cprefix = '[TIMESTAMP] {fgBlue}[INFO] {reset}{fgMagenta}';
        const cformattedText = formatText(cprefix + text)
        beautify.log(cformattedText);
    },

    warn(text, warn) {
        const cprefix = '[TIMESTAMP] {fgYellow}[WARN] {reset}';
        if (warn == null) {
            warn = text
            text = ""
        }
        const cformattedText = formatText(`${cprefix + text}\n{fgYellow}[WARN MESSAGE]: {reset}${warn}`)
        beautify.log(cformattedText);
    },

    error(text, err) {
        const cprefix = '[TIMESTAMP] {fgRed}[ERROR] {reset}';
        if (err === "") {
            err = "No error-message provided"
        }
        if (err == null) {
            err = text
            text = ""
        }
        const cformattedText = formatText(`${cprefix + text}\n{fgRed}[ERROR MESSAGE]: {bright}${err}`)
        beautify.log(cformattedText);
    },

    super_error(text, err) {
        const cprefix = '[TIMESTAMP] {fgRed}{bright}[FATAL ERROR] {bright}';
        const cformattedText = formatText(`${cprefix + text}\n${err}`)
        beautify.log(cformattedText);
    },

    command(ctx) {
        if (commands) {
            const cprefix = '[TIMESTAMP] {fgMagenta}[COMMAND] {reset}';
            // eslint-disable-next-line max-len
            const cformattedText = formatText(`${cprefix + `${ctx.author.tag} (${ctx.author.id}) used the command ${ctx.command.name} in ${ctx.guild.name} (${ctx.guild.id}) in channel ${ctx.channel.name} (${ctx.channel.id})`}`)
            beautify.log(cformattedText);
        }
    },
};
// ==========================================
// *****************************************
