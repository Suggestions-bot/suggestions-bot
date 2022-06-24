const Discord = require('discord.js');
const client = new Discord.Client();

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});


client.on("message", message=>{
  if(message.channel.id === "CHANNELID"){
    message.react(":9VoteUp:743818474534600745")
    message.react(":9VoteDown:743818474551378000")
  }
});

client.login('BOTTOKEN');
