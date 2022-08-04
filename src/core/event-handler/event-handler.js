const path = require('path');
const RequireAll = require('require-all');
const Logger = require('../utils/logger');
const { status, statusType } = require('../../config/bot-config.json');
const { Handler, Client }  = require('discord-slash-command-handler');
let discordClient;

module.exports = {
   init(client, args = { launchTimestamp: Date.now() }) {
      discordClient = client;
      this.initEssentialEvents(client, args);
      this.initEvents(client);
   },

   initEssentialEvents(client = discordClient, args = { launchTimestamp: Date.now() }) {
      // Ready event, which gets fired only once when the bot reaches the ready state
      client.once('ready', async () => {

         const handler = new Handler(client, {
            eventFolder: "./src/events",
            slashGuilds: [],  // string
            allSlash: true,
   
            handleSlash: true, 
            /* True => If you want automatic slash handler
             * False => if you want to handle commands yourself
             * 'both' =>  in this case instead of running the command itself we will invoke an event called 'slashCommand'
             */
            
            handleNormal: false,
            /* True => If you want automatic normal handler
             * False => if you want to handle commands yourself
             * 'both' =>  in this case instead of running the command itself we will invoke an event called 'normalCommand'
             */
            
            permissionReply: "You don't have enough permissions to use this command",   
            timeoutMessage: "You are on a timeout",
            errorReply: "Unable to run this command due to errors...",
        });
         // Updates the bot status every hour
         // client.setInterval(() => updateBotStatus(), 3600000);

         Logger.info(`Successfully launched in ${(Date.now() - args.launchTimestamp) / 1000} seconds!`);
      });


      // Some other somewhat important events that the bot should listen to
      client.on('error', (err) => Logger.error('The client threw an error', err));

      client.on('shardError', (err) => Logger.error('A shard threw an error', err));

      client.on('warn', (warn) => Logger.warn('The client received a warning', warn));
   },

   initEvents(client = discordClient) {
      // Gets all the events from the events folder
      const events = Object.entries(
         RequireAll({
            dirname: path.join(__dirname, 'events'),
            filter: /^(?!-)(.+)\.js$/,
         }),
      );

      /*
       Binds the events gotten with the code above to the client:
         e[0] is the event name (the name of the file)
         e[1] is the function that will get executed when the event gets fired
       */
      events.forEach((e) => client.on(e[0], e[1].bind(null, client)));
   },
};
