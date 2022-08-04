const Logger = require("../../handlers/logger");
const modals  = require("discord-modals");
const db      = require("quick.db");
const Discord = require("discord.js");
const data    = new db.table("suggestion_def")
module.exports = {
  name: "manage", //the command name for the Slash Command
  description: "Manage a suggestion.", //the command description for Slash Command Overview
  cooldown: 5, //the cooldown for the command in seconds (max. 60) 
  memberpermissions: ["manage_server"], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
  requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
  alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
  options: [
    {"String": { name: "message-id", description: "The message ID of the message you want to manage.", required: true }},
    {"StringChoices": { name: "options", description: "Action you want to do", required: true, choices: [["Accept", "accept"], ["Reject", "reject"], ["Reset", "reset"]]}},
  ],
  run: async (client, interaction) => {
    try{
        const {options} = interaction; 

        language = data.get("Language_"+interaction.guild?.id)
        if (language == null) {
            language = "lang_en"
        }
        const lang = require(`../../botconfig/languages/${language}.json`);

        let   givenMessageString = options.getString("message-id");
        let   action = options.getString("options");
        let   key         = "SuggestionsChannel_"+interaction.guild.id;
        let   value       = data.fetch(key)?.channel;
        let   channel   = client.channels.cache.get(value);
        // let   udata      = data.fetch(userKey);


        // let messageUrlString = await udata.map((message, index) => `${message.url}`).join(" ");
        // let messageUrlArray = messageUrlString.split(" ");
        // let messageIdArray = messageUrlArray.map(message => message.split("/")[6]);
        let givenMessageID = "";

        if (givenMessageString.includes("/")) {
            givenMessageID = givenMessageString.split("/")[6];
        } else {
            givenMessageID = givenMessageString;
        };


        let message = await channel.messages.fetch(givenMessageID.toString());

        if (message.author.id.toString() != client.user.id.toString()) {
            interaction.reply(
                {content:"Diese Nachricht kann nicht bearbeitet werden da der Bot nicht der Author dieser Nachricht ist.",ephemeral:true}
            );
             return;
        }
        
        if (action == "accept") {
            let embed = message.embeds[0];
            let newEmbed = {author:embed.author,color:embed.color,timestamp:embed.timestamp,footer:embed.footer,
                description:embed.description,fields:[
                embed.fields[0],
                embed.fields[1],
                {name:"**"+ lang.suggest_accepted + "** <a:Accept:959143988051468319>", value:lang.suggest_accepted_text ,inline:false},
                ]
            }

            message.edit({components: [
                new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                    .setCustomId("up")
                    .setStyle("SUCCESS")
                    .setLabel("👍 " + lang.suggest_upvote)
                    .setDisabled(true),
                    new Discord.MessageButton()
                    .setCustomId("down")
                    .setStyle("DANGER")
                    .setLabel("👎 " + lang.suggest_downvote)
                    .setDisabled(true),
                    new Discord.MessageButton()
                    .setCustomId("accepted")
                    .setStyle("PRIMARY")
                    .setLabel(lang.suggest_accepted)
                    .setEmoji("<a:Accept:959143988051468319>")
                )
                ],embeds: [newEmbed]});
            interaction.reply(
                {content:lang.suggest_accepted_text ,ephemeral:true}
            );
        
        } else if (action == "reject") {
            let embed = message.embeds[0];
            let newEmbed = {author:embed.author,color:embed.color,timestamp:embed.timestamp,footer:embed.footer,
                description:embed.description,fields:[
                embed.fields[0],
                embed.fields[1],
                {name:"**" + lang.suggest_declined + "** <a:Deny:959143988445716620>", value:lang.suggest_declined_text ,inline:false},
                ]
            }

            message.edit({components: [
                new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                    .setCustomId("up")
                    .setStyle("SUCCESS")
                    .setLabel("👍 Upvote")
                    .setDisabled(true),
                    new Discord.MessageButton()
                    .setCustomId("down")
                    .setStyle("DANGER")
                    .setLabel("👎 Downvote")
                    .setDisabled(true),
                    new Discord.MessageButton()
                    .setCustomId("rejected")
                    .setStyle("PRIMARY")
                    .setLabel(lang.suggest_declined)
                    .setEmoji("<a:Deny:959143988445716620>")
                )
                ],embeds: [newEmbed]});
            interaction.reply(
                {content:lang.suggest_declined_text ,ephemeral:true}
            );
        
        } else if (action == "reset") {
            let embed = message.embeds[0];
            let newEmbed = {author:embed.author,color:embed.color,timestamp:embed.timestamp,footer:embed.footer,
                description:embed.description,fields:[
                embed.fields[0],
                embed.fields[1],
                ]
            }

            message.edit({components: [
                new Discord.MessageActionRow()
                .addComponents(
                    new Discord.MessageButton()
                    .setCustomId("up")
                    .setStyle("SUCCESS")
                    .setLabel("👍 Upvote"),
                    new Discord.MessageButton()
                    .setCustomId("down")
                    .setStyle("DANGER")
                    .setLabel("👎 Downvote"),
                )
                ],embeds: [newEmbed]});
            interaction.reply(
                {content:"Der Vorschlag wude auf seinen vorherigen Zustand zurückgesetzt.",ephemeral:true}
            );
        }
    } catch (e) {
        Logger.error(e);
    }
  }
}
