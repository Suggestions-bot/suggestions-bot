//Import Modules
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const settings = require(`../../botconfig/settings.json`);
const { onCoolDown, replacemsg } = require("../../handlers/functions");
const Discord = require("discord.js");
const Logger = require("../../handlers/logger");
const db      = require("quick.db");
const data    = new db.table("suggestion_def")

module.exports = async (client, message) => {
    if(!message.guild || !message.channel || message.author.bot) return;
    if(message.channel.partial) await message.channel.fetch();
    if(message.partial) await message.fetch();

    language = data.get("Language_"+message.guild?.id)
    if (language == null) {
        language = "lang_en"
    }

    const lang = require(`../../botconfig/languages/${language}.json`);
    
    let msg = message
    let          key        = "SuggestionsChannel_"+msg.guild?.id;
    let         guild       = msg.guild
    let        channel      = msg.channel;
    let       msgAuthor     = msg.author;
    let      rawEContent    = msg["content"]
    let data2 = data.fetch(key);
    if (data2 == null) return;
    const badlinks = ["https://", "http://", "www."];
    const nitroscam = ["free", "nitro", "steam", "airdrop", "gift", "minecraft", "epic"];

    if (msg.channelId !== data2.channel) return;

    if (badlinks.some(el => rawEContent.includes(el)) == true) {
        if (msg.deletable) msg.delete();
        try {
            msgAuthor.send(
                {content: lang.suggest_badlink,}
            )
        }
        catch (e) {
            return;
        }
        return;
    }


    if (rawEContent.match(/\b\w+\b/g).filter(word => nitroscam.includes(word)).length > 1) {
        if (msg.deletable) msg.delete();
        try {
            msgAuthor.send(
                {content:lang.suggest_badlink}
            )
        }
        catch (e) {
            return;
        }
        return;
    }

    if (msg.deletable) msg.delete();

    channel.send({
        embeds: [
            {author:{
                name: msgAuthor.username,
                iconURL: msgAuthor.avatarURL({dynamic:true})
            },color:0x2c2f33,timestamp: new Date(),footer:{
                iconURL: guild.iconURL({dynamic:true}),
                text: guild.name
            },description:rawEContent,fields:[
                {name:"👍 " + lang.suggest_upvotes,value:"```\n0```",inline:true},
                {name:"👎 " + lang.suggest_downvotes,value:"```\n0```",inline:true},
            ]}
        ],
        components: [
        new Discord.MessageActionRow()
          .addComponents(
            new Discord.MessageButton()
            .setCustomId("up")
            .setStyle("SUCCESS")
            .setLabel("👍 " + lang.suggest_upvote),
            new Discord.MessageButton()
            .setCustomId("down")
            .setStyle("DANGER")
            .setLabel("👎 " + lang.suggest_downvote),
          )
        ]
    }).then(async message => {
        
        let dataConstructor = {url:message.url.toString(),content:rawEContent}
        let     userKey     = "Suggestions_"+msg.guild.id+"_"+msg.author.id.toString()+".sugs";
        let      udata      = data.fetch(userKey)
        let      value      = {voters: [],votersInfo: []}
        let       key       = message.id.toString()

        if (udata == null) await data.set(userKey, [dataConstructor]);
        else await data.push(userKey, dataConstructor)

        data.set(key, value);
        
    });

}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
