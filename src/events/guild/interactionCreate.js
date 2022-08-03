//Import Modules
const config = require(`../../botconfig/config.json`);
const ee = require(`../../botconfig/embed.json`);
const settings = require(`../../botconfig/settings.json`);
const { onCoolDown, replacemsg } = require("../../handlers/functions");
const Discord = require("discord.js");
const db      = require("quick.db");
const logger = require("../../handlers/logger");
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
          if (voter.includes(interaction.user.id)) {
            await interaction.followUp({content:lang.already_voted, ephemeral:true});
            return;
          }
          let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
              description:embed.description,fields:[
              {name:"👍 Upvotes:",value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
              embed.fields[1],
          ]}
          data.push(key, interaction.user.id);
          data.push(ke2, value)
          await message.edit({components: message.components,embeds: [editedEmbed]})
      }
      break;

      case "down": {
          logger.info(`${interaction.member.user.tag} used ${interaction.commandName}`, "info");
          let   message   = interaction.message;
          let    embed    = message.embeds[0];
          let    dater    = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`
          let     key     = message.id.toString()+".voters";
          let     ke2     = message.id.toString()+".votersInfo";
          let    value    = {user:interaction.user,date: dater}
          let  newNumber  = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) + 1;
          let    voter   = data.fetch(message.id.toString()).voters;
          if (voter.includes(interaction.user.id)) {
            await interaction.followUp({content:lang.already_voted, ephemeral:true});
            return;
          }
          let editedEmbed = {author:embed.author,color:embed.color,timestamp: embed.timestamp,footer:embed.footer,
              description:embed.description,fields:[
              embed.fields[0],
              {name:"👎 Downvotes:",value:`\`\`\`\n${newNumber}\`\`\``,inline:true},
          ]}
          data.push(key, interaction.user.id);
          data.push(ke2, value)
          await message.edit({components: message.components,embeds: [editedEmbed]})
      }
      break;
  
      case "info": {
          let   voters   = data.fetch(interaction.message.id.toString()).votersInfo;
          let    raws    = voters.map((voter, index) => `${index + 1}. ${voter.user.username} - ${voter.date}`).join("\n")

          if (voters == []) return await interaction.followUp({content:lang.already_voted, ephemeral:true}); 

          interaction.followUp({content:raws, ephemeral:true}); 
      }

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
            },color:0x2c2f33,timestamp: new Date(),footer:{
                iconURL: modal.guild?.iconURL({dynamic:true}),
                text: modal.guild?.name
            },description:res,fields:[
                {name:"👍 " + lang.suggest_upvotes ,value:"```\n0```",inline:true},
                {name:"👎 " + lang.suggest_downvotes ,value:"```\n0```",inline:true},
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
