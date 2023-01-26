const beautify = require('beautify.log').default;
const bot_name = require('../botconfig/config.json').bot_name;

function formatText(text) {
    return text.replace('BOTNAME', bot_name);
}

// beautify is used to colorize console logs (https://github.com/lucasgdb/beautify.log)
// *****************************************
// ==========================================
module.exports = {
    info(text) {
        const cprefix = '{fgGreen}[BOTNAME - INFO] {reset}';
        const cformattedText = formatText(cprefix + text)
        beautify.log(cformattedText);
    },

    chunkmessage(text) {
        const cprefix = '{fgBlue}[MODULE - INFO] {reset}{fgMagenta}';
        const cformattedText = formatText(cprefix + text)
        beautify.log(cformattedText);
    },

    warn(text, warn) {
        const cprefix = '{fgYellow}[BOTNAME - WARN] {reset}';
        if (warn == null) {
            warn = text
            text = ""
        }
        const cformattedText = formatText(`${cprefix + text}\n{fgYellow}[WARN MESSAGE]: {reset}${warn}`)
        beautify.log(cformattedText);
    },

    error(text, err) {
        const cprefix = '{fgRed}[BOTNAME - ERROR] {reset}';
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
        const cprefix = '{fgRed}{bright}[BOTNAME - SUPER ERROR] {bright}';
        const cformattedText = formatText(`${cprefix + text}\n${err}`)
        beautify.log(cformattedText);
    },

    command(ctx) {
        if (commands) {
            const cprefix = '{fgMagenta}[BOTNAME - COMMAND] {reset}';
            // eslint-disable-next-line max-len
            const cformattedText = formatText(`${cprefix + `${ctx.author.tag} (${ctx.author.id}) used the command ${ctx.command.name} in ${ctx.guild.name} (${ctx.guild.id}) in channel ${ctx.channel.name} (${ctx.channel.id})`}`)
            beautify.log(cformattedText);
        }
    },
};
// ==========================================
// *****************************************
