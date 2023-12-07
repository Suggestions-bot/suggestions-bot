const Discord = require("discord.js");
const logger = require("../logger");
const client = new Discord.Client({

  // {
  //   '1': 'Guilds',
  //   '2': 'GuildMembers',
  //   '4': 'GuildBans',
  //   '8': 'GuildEmojisAndStickers',
  //   '16': 'GuildIntegrations',
  //   '32': 'GuildWebhooks',
  //   '64': 'GuildInvites',
  //   '128': 'GuildVoiceStates',
  //   '256': 'GuildPresences',
  //   '512': 'GuildMessages',
  //   '1024': 'GuildMessageReactions',
  //   '2048': 'GuildMessageTyping',
  //   '4096': 'DirectMessages',
  //   '8192': 'DirectMessageReactions',
  //   '16384': 'DirectMessageTyping',
  //   '32768': 'MessageContent',
  //   '65536': 'GuildScheduledEvents',
  //   '1048576': 'AutoModerationConfiguration',
  //   '2097152': 'AutoModerationExecution',
  //   Guilds: 1,
  //   GuildMembers: 2,
  //   GuildModeration: 4,
  //   GuildBans: 4,
  //   GuildEmojisAndStickers: 8,
  //   GuildIntegrations: 16,
  //   GuildWebhooks: 32,
  //   GuildInvites: 64,
  //   GuildVoiceStates: 128,
  //   GuildPresences: 256,
  //   GuildMessages: 512,
  //   GuildMessageReactions: 1024,
  //   GuildMessageTyping: 2048,
  //   DirectMessages: 4096,
  //   DirectMessageReactions: 8192,
  //   DirectMessageTyping: 16384,
  //   MessageContent: 32768,
  //   GuildScheduledEvents: 65536,
  //   AutoModerationConfiguration: 1048576,
  //   AutoModerationExecution: 2097152
  // }

  shards: "auto",
  allowedMentions: {
    parse: [],
    repliedUser: false,
  },
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildMessageReactions,
  ],
  presence: {
    activity: {
      name: `Suggestions`,
      type: "WATCHING",
    },
    status: "online"
  }
});

//Define some Global Collections

client.commands = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.slashCommands = new Discord.Collection();
client.aliases = new Discord.Collection();


//Require the Handlers                  Add the antiCrash file too, if its enabled

["events", "slashCommands", process.env.BOT_ANTI_CRASH ? "antiCrash" : null]
  .filter(Boolean)
  .forEach(h => {
    require(`./handlers/${h}`)(client);
  })

//Start the Bot

client.login(process.env.DISCORD_TOKEN).then(() => logger.startup("Started Bot")).catch(e => console.log(e));
