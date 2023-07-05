//Import Modules
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const settings = require(`../../botconfig/settings.json`);
const {onCoolDown, replacemsg} = require("../../handlers/functions");
const Discord = require("discord.js");
const Logger = require("../../../logger");
const db = require("../../../database");

module.exports = async (client, message) => {
    if (!message.guild || !message.channel || message.author.bot) return;
    if (message.channel.partial) await message.channel.fetch();
    if (message.partial) await message.fetch();

    let msg = message;
    // really unoptimized, one db call for each message
    // console.log(msg.guild?.id)
    let data2 = await db.getServerSuggestionChannel(msg.guild?.id)
    // console.log(data2)
    if (data2 == null) return;
    if (msg.channelId !== data2) return;

    let guild = msg.guild;
    let channel = msg.channel;
    let msgAuthor = msg.author;
    let rawEContent = msg["content"];

    if (rawEContent == null || rawEContent == undefined || rawEContent == "") {
        if (msg.deletable) {
            msg.delete();
        }
        return;
    }

    if (msg.type == "THREAD_STARTER_MESSAGE") return;

    /*const badlinks = ["https://", "http://", "www."];
    const nitroscam = ["free", "nitro", "steam", "airdrop", "gift", "minecraft", "epic", "tiktok"]; // somehow servers with TikTok etc. in their name are still getting advertised
    const immedeateDelete = [""];*/


    const serverdata = await db.getAllServerSettings(msg.guild?.id);
    let language = await db.getServerLanguage(msg.guild?.id);

    if (language == null) {
        language = "lang_en";
    }
    const lang = require(`../../botconfig/languages/${language}.json`);

    // too lazy to make this better, sorry
    let dicon;
    let ecolor;
    let uicon;
    if (serverdata["suggestion_embed_color"] !== null && serverdata["suggestion_embed_color"] !== undefined && serverdata["suggestion_embed_color"] !== "") {
        ecolor = serverdata["suggestion_embed_color"];
    } else {
        ecolor = "2C2F33";
    }
    if (serverdata["upvote_emoji"] !== null && serverdata["upvote_emoji"] !== undefined && serverdata["upvote_emoji"] !== "") {
        uicon = serverdata["upvote_emoji"];
    } else {
        uicon = "👍";
    }
    if (serverdata["downvote_emoji"] !== null && serverdata["downvote_emoji"] !== undefined && serverdata["downvote_emoji"] !== "") {
        dicon = serverdata["downvote_emoji"];
    } else {
        dicon = "👎";
    }

    //Removes bad links | Disabled for now since server owners can use auto mod
    /*let allowlinks = await db.getServerAllowsLinks(msg.guild?.id);
    if (badlinks.some((el) => rawEContent.includes(el)) === true && allowlinks !== true) {
        if (badlinks.some((el) => rawEContent.includes(el)) === true) {
            if (msg.deletable) msg.delete();
            try {
                msgAuthor.send({content: lang.suggest_badlink});
            } catch (e) {
                return;
            }
            return;
        }
    }

    try {
        if (
            rawEContent.match(/\b\w+\b/g).filter((word) => nitroscam.includes(word))
                .length > 1
        ) {
            if (msg.deletable) msg.delete();
            try {
                msgAuthor.send({content: lang.suggest_badlink});
            } catch (e) {
                return;
            }
            return;
        }
    } catch (e) {
        if (msg.deletable) msg.delete();
        return;
    }*/

    try {
        if (msg.deletable) msg.delete();
    } catch (e) {
        e = null;
    }

    try {
        let sugMessage = await channel
            .send({
                embeds: [{
                    author: {
                        name: msgAuthor.username, iconURL: msgAuthor.avatarURL({dynamic: true}),
                    }, color: ecolor, timestamp: new Date(), footer: {
                        iconURL: guild.iconURL({dynamic: true}), text: guild.name,
                    }, description: rawEContent, fields: [{
                        name: uicon + " " + lang.suggest_upvotes, value: "```\n0```", inline: true,
                    }, {
                        name: dicon + " " + lang.suggest_downvotes, value: "```\n0```", inline: true,
                    },],
                },], components: [new Discord.MessageActionRow().addComponents(new Discord.MessageButton()
                    .setCustomId("up")
                    .setStyle("SUCCESS")
                    .setLabel(lang.suggest_upvote)
                    .setEmoji(`${uicon}`), new Discord.MessageButton()
                    .setCustomId("down")
                    .setStyle("DANGER")
                    .setLabel(lang.suggest_downvote)
                    .setEmoji(`${dicon}`)),],
            })
            .then(async (message) => {
                await db.addNewSuggestion(msg.guild?.id, message.id, rawEContent, msgAuthor.id);
                return message;
            });

        let thread = await db.getServerAutoThread(msg.guild?.id);
        if (thread == null) return;
        let starterMessage = rawEContent.substring(0, 95);
        if (starterMessage.includes(". ")) {
            starterMessage = starterMessage.split(". ")[0];
        }
        if (starterMessage.includes("\n")) {
            starterMessage = starterMessage.split("\n")[0];
        }
        if (starterMessage.length > 95) {
            starterMessage += "...";
        }
        if (thread == true) {
            try {
                let threadChannel = await sugMessage.startThread({
                    name: starterMessage,
                });
                await db.setSuggestionThread(sugMessage.id, threadChannel.id);
            } catch (e) {
                e = null;
            }
        }

    } catch (e) {
        Logger.error("Error while creating suggestion message (Spam?):");
        console.log(e);
    }
};

function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}