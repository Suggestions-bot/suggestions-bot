//Import Modules
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const settings = require(`../../botconfig/settings.json`);
const { onCoolDown, replacemsg } = require("../../handlers/functions");
const Discord = require("discord.js");
const db      = require("quick.db");
const logger = require("../../handlers/logger");
const { lang } = require("moment");
const data    = new db.table("suggestion_def")


module.exports = (client, interaction) => {
	const CategoryName = interaction.commandName;
	let command = false;
	try{
    	    if (client.slashCommands.has(CategoryName + interaction.options.getSubcommand())) {
      		command = client.slashCommands.get(CategoryName + interaction.options.getSubcommand());
    	    }
  	}catch{
    	    if (client.slashCommands.has("normal" + CategoryName)) {
      		command = client.slashCommands.get("normal" + CategoryName);
   	    }
	}
	if(command) {
		if (onCoolDown(interaction, command)) {
			  return interaction.reply({ephemeral: true,
				embeds: [new Discord.MessageEmbed()
				  .setColor(ee.wrongcolor)
				  .setFooter(ee.footertext, ee.footericon)
				  .setTitle(replacemsg(settings.messages.cooldown, {
					prefix: prefix,
					command: command,
					timeLeft: onCoolDown(interaction, command)
				  }))]
			  });
			}
		//execute the Command
		command.run(client, interaction, interaction.member, interaction.guild)
	}
  if (interaction.isButton()) return buttons(interaction);
  // logger.info(interaction.type + " " + interaction.guild.name + " " + interaction.user.username + " " + interaction.commandName + " " + interaction.options.getSubcommand());
  if (interaction.type.toString() == "MODAL_SUBMIT") return modalSubmit(client, interaction);
}



async function confirmRevote(interaction, lang) {

  await interaction.followUp({
    content: lang.already_voted_rechoice, 
    components: [
      new Discord.MessageActionRow()
        .addComponents(
          new Discord.MessageButton()
          .setCustomId("up-rechoice")
          .setStyle("SUCCESS")
          .setLabel(uicon + " " + lang.suggest_upvote),
          new Discord.MessageButton()
          .setCustomId("down-rechoice")
          .setStyle("DANGER")
          .setLabel(dicon + " " + lang.suggest_downvote),
        )
      ]
    }
  );


}

/**
 * 
 * @param {Discord.ButtonInteraction} interaction 
 */
async function buttons(interaction) {
  // logger.info(`${interaction.member.user.tag} used ${interaction.commandName}`, "info");
  await interaction.deferUpdate().catch(() => {})

  language = data.get("Language_"+interaction.guild?.id)
  if (language == null) {
      language = "lang_en"
  }
  const lang = require(`../../botconfig/languages/${language}.json`);
  let edata = data.get("CustomEmbed_"+interaction.guild?.id);
  if (edata == null) {
    var dicon = "👎"
    var ecolor = "2C2F33"
    var uicon = "👍"
  } else {
    var dicon = data.get("CustomEmbed_"+interaction.guild?.id+".dicon");
    var ecolor = data.get("CustomEmbed_"+interaction.guild?.id+".color");
    var uicon = data.get("CustomEmbed_"+interaction.guild?.id+".uicon");
  }

  // logger.info(uicon + " " + ecolor + " " + dicon);

  switch (interaction.customId) {
      case "up": {
          let   message   = interaction.message;
          let    embed    = message.embeds[0];
          let    dater    = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
          let     key     = message.id.toString()+".voters";
          let     ke2     = message.id.toString()+".votersInfo";
          let     key3     = message.id.toString()+".reVoters";
          let     key4     = message.id.toString()+".upVoters";
          let    value    = {user:interaction.user,date: dater}
          let  newNumber  = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) + 1;
          let    voter   = data.fetch(message.id.toString()).voters;
          if (voter.includes(interaction.user.id)) {
            if (data.fetch(message.id.toString()).reVoters.includes(interaction.user.id)) {
              await confirmRevote(interaction, lang);
            }
            else {
              await interaction.followUp({content:lang.already_voted, ephemeral:true});
              return;
            }
          }
          let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
              description:embed.description,fields:[
              {name:uicon+" " + lang.suggest_upvotes, value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
              embed.fields[1],
          ]}
          data.push(key, interaction.user.id);
          data.push(key4, interaction.user.id);
          data.push(ke2, value)
          await message.edit({components: message.components,embeds: [editedEmbed]})
      }
      break;

      case "down": {
          // logger.info(`${interaction.member.user.tag} used ${interaction.commandName}`, "info");
          let   message   = interaction.message;
          let    embed    = message.embeds[0];
          let    dater    = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
          let     key     = message.id.toString()+".voters";
          let     ke2     = message.id.toString()+".votersInfo";
          let     key3     = message.id.toString()+".reVoters";
          let     key4     = message.id.toString()+".downVoters";
          let    value    = {user:interaction.user,date: dater}
          let  newNumber  = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) + 1;
          let    voter   = data.fetch(message.id.toString()).voters;
          if (voter.includes(interaction.user.id)) {
            if (data.fetch(message.id.toString()).reVoters.includes(interaction.user.id)) {
              await confirmRevote(interaction, lang);
            }
            else {
              await interaction.followUp({content:lang.already_voted, ephemeral:true});
              return;
            }
          }
          let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
              description:embed.description,fields:[
              embed.fields[0],
              {name:dicon+" " + lang.suggest_downvotes, value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
          ]}
          data.push(key, interaction.user.id);
          data.push(key4, interaction.user.id);
          data.push(ke2, value)
          await message.edit({components: message.components,embeds: [editedEmbed]})
      }
      break;

      case "up-rechoice": {
        let   message   = interaction.message;
        let    embed    = message.embeds[0];
        let    dater    = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
        let     key     = message.id.toString()+".voters";
        let     ke2     = message.id.toString()+".votersInfo";
        let    value    = {user:interaction.user,date: dater}
        let  newNumber  = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) - 1;
        let  newNumber1  = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) + 1;
        let    voter   = data.fetch(message.id.toString()).voters;
        let     key4     = message.id.toString()+".downVoters";
        let     key5     = message.id.toString()+".upVoters";

        if (data.fetch(message.id.toString()).upVoters.includes(interaction.user.id)) {+
          await interaction.followUp({content:lang.already_voted_option, ephemeral:true});
          return;
        } else if (data.fetch(message.id.toString()).downVoters.includes(interaction.user.id)) {
          let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
            description:embed.description,fields:[
              {name:dicon+" " + lang.suggest_upvotes, value:`\`\`\`\n${newNumber1}\`\`\``,inline:true},
            {name:dicon+" " + lang.suggest_downvotes, value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
        ]}
        return;
        } else {
         await interaction.followUp({content:lang.already_voted, ephemeral:true});
         return;
        }
      }
      break;

      case "down-rechoice": {

      }
      break;
  
      case "info": {
          let   voters   = data.fetch(interaction.message.id.toString()).votersInfo;
          let    raws    = voters.map((voter, index) => `${index + 1}. ${voter.user.username} - ${voter.date}`).join("\n")

          if (voters == []) return await interaction.followUp({content:lang.already_voted, ephemeral:true}); 

          interaction.followUp({content:raws, ephemeral:true}); 
      }
      break;

      case "accepted": {
        await interaction.followUp({content:lang.already_accepted , ephemeral:true});
      }
      break;

      case "rejected": {
        await interaction.followUp({content:lang.already_declined , ephemeral:true});
      }
      break;

      default:
          break;
  }
}

async function modalSubmit(client, modal) {
  if (modal.customId == 'send') {
    let         key         = "SuggestionsChannel_"+modal.guild?.id;
    let         res         = modal.fields.getTextInputValue('input');
    let        value        = data.fetch(key)?.channel
    let       channel       = client.channels.cache.get(value);
    const badlinks = ["https://", "http://", "www."];
    const nitroscam = ["free", "nitro", "steam", "airdrop", "gift", "minecraft", "epic"];

    language = data.get("Language_"+modal.guild?.id)
    if (language == null) {
        language = "lang_en"
    }
    const lang = require(`../../botconfig/languages/${language}.json`);
    let edata = data.get("CustomEmbed_"+interaction.guild?.id);
    if (edata == null) {
      var dicon = "👎"
      var ecolor = "2C2F33"
      var uicon = "👍"
    } else {
      var dicon = data.get("CustomEmbed_"+interaction.guild?.id+".dicon");
      var ecolor = data.get("CustomEmbed_"+interaction.guild?.id+".color");
      var uicon = data.get("CustomEmbed_"+interaction.guild?.id+".uicon");
    }

    //Removes bad links
    if (badlinks.some(el => res.includes(el)) == true) {
            modal.reply(
                {content:lang.suggest_badlink ,ephemeral:true}
            )
            return;
        }
    
    //Removes nitro scams
    if (res.match(/\b\w+\b/g).filter(word => nitroscam.includes(word)).length > 1) {
        modal.reply(
            {content:lang.suggest_badlink ,ephemeral:true}
        )
        return;
    }

    //Message for channel not being set
    if (!channel) return modal.reply(
        {content:lang.suggest_channel_not_set ,ephemeral:true}
    );

    //Sends message to confirm the suggestion
    modal.reply(
        {content:lang.suggest_sent ,ephemeral:true}
    );
    channel.send({
        embeds: [
            {author:{
                name: modal.user.username,
                iconURL: modal.user.avatarURL({dynamic:true})
            },color: ecolor,timestamp: new Date(),footer:{
                iconURL: modal.guild?.iconURL({dynamic:true}),
                text: modal.guild?.name
            },description:res,fields:[
                {name:uicon + " " + lang.suggest_upvotes ,value:"```\n0```",inline:true},
                {name:dicon + " " + lang.suggest_downvotes ,value:"```\n0```",inline:true},
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
}
