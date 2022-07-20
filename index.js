// imports
const Discord = require("discord.js");
const modals  = require("discord-modals");
const ora     = require("ora");
const chalk   = require("chalk");
const db      = require("quick.db");
const fs      = require("node:fs");

// constructors
const data    = new db.table("suggestion_def")
const client  = new Discord.Client({
   intents: 32767 
});
modals(client);

// ready event and slash commands reg
client.on("ready", () => {
    let _ = ora("Processing Clients...").start();
    setTimeout(() => _.color = "yellow", 430)
    setTimeout(() => _.succeed("Client has logged in as "+chalk.red.bold(client.user.username)),1200)
    let commands = [
        {name:"set-suggestion-channel",description:"set the suggestions channel",type:1},
        {name:"remove-suggestion-channel",description:"remove the suggestions channel",type:1},
        {name:"vorschlag",description:"Einen Vorschlag schicken",type:1},
        {name:"get-user-suggestions",description:"get suggestions of any user",type:1,options:[
            {name:"user",description:"the user you will get the suggestion from",required:true,type:6}
        ]},
        {name:"vorschlag-bearbeiten",description:"Einen deiner Vorschläge bearbeiten",type:1,options:[
            {name:"nachrichten-id",description:"Die ID des Vorschlags den du bearbeiten willst.",required:true,type:3},
            {name:"neuer-vorschlag",description:"Der ausgebesserte / ergänzte Vorschlag.",required:true,type:3}
        ]},
        {name:"manage-suggestions",description:"Manage a suggestion",type:1,options:[
            {name:"message-id",description:"Message ID of the suggestion you want to manage",required:true,type:3},
            {name:"action",description:"Action you want to do",required:true,type:3,choices:[
                {name:"Accept",description:"Accept the suggestion", value:"accept"},
                {name: "Reject", description: "Reject the suggestion", value: "reject"},
                {name: "Reset", description: "Reset the Acception/Rejection to make users able to vote again.", value: "reset"},
            ]},
        ]},
    ];
    client.application.commands.set(commands)
}).login(fs.readFileSync(__dirname+"/.env", {encoding:"utf-8"}));

// interactionDetected event
client.on("interactionCreate", async(interaction) => {
    // some condetions
    if (interaction.isButton()) return await buttons(interaction);
    if (
        !interaction.isCommand()
        || 
        !interaction.guild?.id
        ||
        !interaction.user
        ||
        interaction.channel.type == "DM"
        ||
        !interaction.guild.me.permissionsIn(interaction.channel)
        .has(Discord.Permissions.FLAGS.SEND_MESSAGES)
       )
    return;
    if (interaction.commandName == "set-suggestion-channel") {
        if (!interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD))
        return interaction.reply(
            {content:"Du hast keine permissions um **`"+interaction.commandName+"`** zu nutzen.",ephemeral:true}
        )
        let channel = interaction.channelId;
        let  value   = {channel:channel}
        let   key   = "SuggestionsChannel_"+interaction.guild?.id;

        data.set(key, value)
        interaction.reply(
            {content:"<#"+channel+"> has set as suggestion channel on **"+interaction.guild?.name+"**.",ephemeral:true}
        )
    }
    else if (interaction.commandName == "remove-suggestion-channel") {
        if (!interaction.member.permissions.has(Discord.Permissions.FLAGS.MANAGE_GUILD))
        return interaction.reply(
            {content:"Du hast keine permissions um **`"+interaction.commandName+"`** zu nutzen.",ephemeral:true}
        )
        let key     = "SuggestionsChannel_"+interaction.guild?.id;

        data.delete(key)
        interaction.reply(
            {content:"Suggestion kanal wurde bearbeitet.",ephemeral:true}
        )
    }
    else if (interaction.commandName == "get-user-suggestions") {
        let  userInfos  = interaction.options.getUser("user",true);
        let   userKey   = "Suggestions_"+interaction.guild.id+"_"+userInfos.id.toString()+".sugs";
        let    udata    = data.fetch(userKey);

        if (udata == null) return interaction.reply(
            {content:"<@"+userInfos.id+"> hat keine votes auf **"+interaction.guild?.name+"**.",ephemeral:true}
        )
        else {
            let calSugs = await udata.map((message, index) => `${index + 1}. [zur suggestion](${message.url})\n\`\`\`\n${message.content}\`\`\``).join("\n\n");
            interaction.reply(
                {content:calSugs,ephemeral:true}
            )
        }
    }
    else if (interaction.commandName == "vorschlag") {
        const modal = new modals.Modal()
        .setCustomId('send')
        .setTitle('Schreib dein vorschlag drunter:')
        .addComponents(
          new modals.TextInputComponent()
            .setCustomId('input')
            .setLabel('Vorschlag')
            .setStyle('LONG')
            .setMinLength(3)
            .setMaxLength(1024)
            .setPlaceholder('Schreib deinen Vorschlag bitte hier hin!')
            .setRequired(true)
        );

        let modalData = await modals.showModal(modal, {
            client: client,
            interaction: interaction
        });
        modalData;
    }
    else if (interaction.commandName == "vorschlag-bearbeiten") {
        let   key         = "SuggestionsChannel_"+interaction.guild.id;
        let   value       = data.fetch(key)?.channel
        let   channel   = client.channels.cache.get(value);
        let   userID    = interaction.user.id;
        let   userKey  = "Suggestions_"+interaction.guild.id+"_"+userID.toString()+".sugs";
        let   udata      = data.fetch(userKey);
        
        if (udata == null) return interaction.reply(
            {content:"Du hast noch keinen Vorschlag gemacht. ",ephemeral:true}
        )


        let messageUrlString = await udata.map((message, index) => `${message.url}`).join(" ");
        let messageUrlArray = messageUrlString.split(" ");
        let messageIdArray = messageUrlArray.map(message => message.split("/")[6]);
        let givenMessageString = interaction.options.getString("nachrichten-id",true);
        let givenMessageID = "";

        if (givenMessageString.includes("/")) {
            givenMessageID = givenMessageString.split("/")[6];
        } else {
            givenMessageID = givenMessageString;
        }

        // console.log(messageUrlString);
        // console.log(messageUrlArray);
        // console.log(messageIdArray);

        if (!messageIdArray.includes(givenMessageID)) return interaction.reply(
            {content:"Eine Nachricht von dir mit dieser ID existiert nicht im Vorschläge-Channel.",ephemeral:true}
        );

        let message = await channel.messages.fetch(givenMessageID.toString());
        let newMessage = interaction.options.getString("neuer-vorschlag",true);
        let    embed    = message.embeds[0];

        let editedEmbed = {author:embed.author,color:embed.color,timestamp:embed.timestamp,footer:embed.footer,
            description:newMessage,fields:[
            embed.fields[0],
            embed.fields[1],
        ]}

        message.edit({components: message.components,embeds: [editedEmbed]})
        interaction.reply(
            {content:"Dein Vorschlag wurde erfolgreich bearbeitet.",ephemeral:true}
        );
    }
    else if (interaction.commandName == "manage-suggestions") {
        let   givenMessageString = interaction.options.getString("message-id",true);
        let   action = interaction.options.get("action",true).value;
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
                {name:"**Angenommen** <a:Accept:959143988051468319>", value:"Dieser Vorschlag wurde angenommen.",inline:false},
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
                    .setCustomId("accepted")
                    .setStyle("PRIMARY")
                    .setLabel("Angenommen")
                    .setEmoji("<a:Accept:959143988051468319>")
                )
                ],embeds: [newEmbed]});
            interaction.reply(
                {content:"Vorschlag wurde als angenommen markiert.",ephemeral:true}
            );
        
        } else if (action == "reject") {
            let embed = message.embeds[0];
            let newEmbed = {author:embed.author,color:embed.color,timestamp:embed.timestamp,footer:embed.footer,
                description:embed.description,fields:[
                embed.fields[0],
                embed.fields[1],
                {name:"**Abgelehnt** <a:Deny:959143988445716620>", value:"Dieser Vorschlag wurde abgelehnt.",inline:false},
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
                    .setLabel("Abgelehnt")
                    .setEmoji("<a:Deny:959143988445716620>")
                )
                ],embeds: [newEmbed]});
            interaction.reply(
                {content:"Vorschlag wurde als abgelehnt markiert.",ephemeral:true}
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
    }
});



// respond for modals
client.on('modalSubmit', async (modal) => {
    if (modal.customId == 'send') {
        let         key         = "SuggestionsChannel_"+modal.guild?.id;
        let         res         = modal.getTextInputValue('input');
        let        value        = data.fetch(key)?.channel
        let       channel       = client.channels.cache.get(value);
        const badlinks = ["https://", "http://", "www."];
        const nitroscam = ["free", "nitro", "steam", "airdrop", "gift", "minecraft", "epic"];

        if (badlinks.some(el => res.includes(el)) == true) {
                modal.reply(
                    {content:"Der Vorschlag wurde nicht gesendet, da er Links enthält.\nFalls du der Meinung bist, dass in diesem Vorschlag kein Link war, wende dich bitte an einen Administrator.",ephemeral:true}
                )
                return;
            }
        

        if (res.match(/\b\w+\b/g).filter(word => nitroscam.includes(word)).length > 1) {
            modal.reply(
                {content:"Der Vorschlag wurde nicht gesendet, da er zu viel Ähnlichkeit mit Nitro-Scam-Nachrichten hat.\nFalls du der Meinung bist, dass in diesem Vorschlag kein Nitro-Scam war, wende dich bitte an einen Administrator.",ephemeral:true}
            )
            return;
        }

        if (!channel) return modal.reply(
            {content:'Sorry! Der suggestion-channel wurde noch nicht gesetzt!',ephemeral:true}
        );

        modal.reply(
            {content:'Danke! Dein Vorschlag wurde geschickt.',ephemeral:true}
        );
        channel.send({
            embeds: [
                {author:{
                    name: modal.user.username,
                    iconURL: modal.user.avatarURL({dynamic:true})
                },color:0x2c2f33,timestamp: new Date(),footer:{
                    iconURL: modal.guild?.iconURL({dynamic:true}),
                    text: modal.guild?.name
                },description:res,fields:[
                    {name:"👍 Upvotes:",value:"```\n0```",inline:true},
                    {name:"👎 Downvotes:",value:"```\n0```",inline:true},
                ]}
            ],
            components: [
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
            ]
        }).then(async message => {
            
            let dataConstructor = {url:message.url.toString(),content:res}
            let     userKey     = "Suggestions_"+modal.guild?.id+"_"+modal.user.id.toString()+".sugs";
            let      udata      = data.fetch(userKey)
            let      value      = {voters: [],votersInfo: []}
            let       key       = message.id.toString()

            if (udata == null) await data.set(userKey, [dataConstructor]);
            else data.push(userKey, dataConstructor)

            data.set(key, value);
            
        });
    }  
  });

// message event
client.on("messageCreate", (msg) => {
    if (msg.author.bot) return;
    if (!msg.guild?.id) return;

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
                {content:"Der Vorschlag wurde nicht gesendet, da er zu viel Ähnlichkeit mit Nitro-Scam-Nachrichten hat.\nFalls du der Meinung bist, dass in diesem Vorschlag kein Nitro-Scam war, wende dich bitte an einen Administrator."}
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
                {content:"Der Vorschlag wurde nicht gesendet, da er zu viel Ähnlichkeit mit Nitro-Scam-Nachrichten hat.\nFalls du der Meinung bist, dass in diesem Vorschlag kein Nitro-Scam war, wende dich bitte an einen Administrator."}
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
                {name:"👍 Upvotes:",value:"```\n0```",inline:true},
                {name:"👎 Downvotes:",value:"```\n0```",inline:true},
            ]}
        ],
        components: [
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
})
/**
 * 
 * @param {Discord.ButtonInteraction} interaction 
 */
async function buttons(interaction) {
    await interaction.deferUpdate().catch(() => {})
    switch (interaction.customId) {
        case "up": {
            let   message   = interaction.message;
            let    embed    = message.embeds[0];
            let    dater    = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
            let     key     = message.id.toString()+".voters";
            let     ke2     = message.id.toString()+".votersInfo";
            let    value    = {user:interaction.user,date: dater}
            let  newNumber  = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) + 1;
            let    voter   = data.fetch(message.id.toString()).voters;
            if (voter.includes(interaction.user.id)) return interaction.followUp({content:"Du hast schon gevoted!", ephemeral:true});
            let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
                description:embed.description,fields:[
                {name:"👍 Upvotes:",value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
                embed.fields[1],
            ]}
            await data.push(key, interaction.user.id);
            await data.push(ke2, value)
            message.edit({components: message.components,embeds: [editedEmbed]})
        }
        break;

        case "down": {
            let   message   = interaction.message;
            let    embed    = message.embeds[0];
            let    dater    = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
            let     key     = message.id.toString()+".voters";
            let     ke2     = message.id.toString()+".votersInfo";
            let    value    = {user:interaction.user,date: dater}
            let  newNumber  = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) + 1;
            let    voter   = data.fetch(message.id.toString()).voters;
            if (voter.includes(interaction.user.id)) return interaction.followUp({content:"Du hast schon gevoted!", ephemeral:true});
            let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
                description:embed.description,fields:[
                embed.fields[0],
                {name:"👎 Downvotes:",value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
            ]}
            await data.push(key, interaction.user.id);
            await data.push(ke2, value)
            message.edit({components: message.components,embeds: [editedEmbed]})
        }
        break;
    
        case "info": {
            let   voters   = data.fetch(interaction.message.id.toString()).votersInfo;
            let    raws    = voters.map((voter, index) => `${index + 1}. ${voter.user.username} - ${voter.date}`).join("\n")

            if (voters == []) return interaction.followUp({content:"Niemand hat gevoted!", ephemeral:true}); 

            interaction.followUp({content:raws, ephemeral:true}); 
        }

        case "accepted": {
            interaction.followUp({content:"Dieser Vorschlag wurde angenommen, du kannst deshalb nicht mehr abstimmen.", ephemeral:true});
        }
        case "rejected": {
            interaction.followUp({content:"Dieser Vorschlag wurde abgelehnt, du kannst deshalb nicht mehr abstimmen.", ephemeral:true});
        }
        break;
        default:
            break;
    }
}
