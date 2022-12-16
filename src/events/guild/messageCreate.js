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

    let msg = message
    let          key        = "SuggestionsChannel_"+msg.guild?.id;

    let data2 = data.fetch(key);
    if (data2 == null) return;
    if (msg.channelId !== data2.channel) return;

    language = data.get("Language_"+message.guild?.id)
    if (language == null) {
        language = "lang_en"
    }

    let edata = data.get("CustomEmbed_"+message.guild?.id);
    if (edata == null) {
      var dicon = "👎"
      var ecolor = "2C2F33"
      var uicon = "👍"
    } else {
      var dicon = data.get("CustomEmbed_"+message.guild?.id+".dicon");
      var ecolor = data.get("CustomEmbed_"+message.guild?.id+".color");
      var uicon = data.get("CustomEmbed_"+message.guild?.id+".uicon");
    }

    const lang = require(`../../botconfig/languages/${language}.json`);

    let         guild       = msg.guild
    let        channel      = msg.channel;
    let       msgAuthor     = msg.author;
    let      rawEContent    = msg["content"]

    const badlinks = ["https://", "http://", "www."];
    const nitroscam = ["free", "nitro", "steam", "airdrop", "gift", "minecraft", "epic"];



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


    try {
        if (rawEContent.match(/\b\w+\b/g).filter(word => nitroscam.includes(word)).length > 1) {
            if (msg.deletable) msg.delete();
            try {
                msgAuthor.send(
                    {content: lang.suggest_badlink}
                )
            } catch (e) {
                return;
            }
            return;
        }
    } catch (e) {
        if (msg.deletable) msg.delete();
        return;
    }

    if (msg.deletable) msg.delete();

    channel.send({
        embeds: [
            {author:{
                name: msgAuthor.username,
                iconURL: msgAuthor.avatarURL({dynamic:true})
            },color:ecolor,timestamp: new Date(),footer:{
                iconURL: guild.iconURL({dynamic:true}),
                text: guild.name
            },description:rawEContent,fields:[
                {name:uicon + " " + lang.suggest_upvotes,value:"```\n0```",inline:true},
                {name:dicon + " " + lang.suggest_downvotes,value:"```\n0```",inline:true},
            ]}
        ],
        components: [
        new Discord.MessageActionRow()
          .addComponents(
            new Discord.MessageButton()
            .setCustomId("up")
            .setStyle("SUCCESS")
            .setLabel(uicon + " " + lang.suggest_upvote),
            new Discord.MessageButton()
            .setCustomId("down")
            .setStyle("DANGER")
            .setLabel(dicon + " " + lang.suggest_downvote),
          )
        ]
    }).then(async message => {
        
        let dataConstructor = {url:message.url.toString(),content:rawEContent}
        let     userKey     = "Suggestions_"+msg.guild.id+"_"+msg.author.id.toString()+".sugs";
        let      udata      = data.fetch(userKey)
        let      value      = {voters: [],votersInfo: [],reVoters: [],reVotersInfo: [],upvotes: 0,downvotes: 0}
        let       key       = message.id.toString()

        //Logger.info(`New Suggestion by ${msgAuthor.tag} in ${guild.name} | ${message.url} | With Userdata: ${udata}`)
        if (udata == null) await data.set(userKey, [dataConstructor]);
        else data.push(userKey, dataConstructor)

        data.set(key, value);
        
    });

}
function escapeRegex(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
}
