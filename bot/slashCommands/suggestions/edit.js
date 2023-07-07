const Logger = require("../../../logger");
const modals = require("discord-modals");
const db = require("../../../database");
const logger = require("../../../logger");

module.exports = {
    name: "edit", //the command name for the Slash Command
    description: "Edit your suggestion.", //the command description for Slash Command Overview
    cooldown: 5, //the cooldown for the command in seconds (max. 60)
    memberpermissions: [], //Only allow members with specific Permissions to execute a Commmand [OPTIONAL]
    requiredroles: [], //Only allow specific Users with a Role to execute a Command [OPTIONAL]
    alloweduserids: [], //Only allow specific Users to execute a Command [OPTIONAL]
    options: [

        {
            "String": {
                name: "message-id",
                description: "The message ID of the message you want to edit.",
                required: false
            }
        },
    ],
    run: async (client, interaction) => {
        try {
            const {options} = interaction;

            const language = await db.getServerLanguage(interaction.guild.id)
            const lang = require(`../../botconfig/languages/${language}.json`);


            let givenMessageString = options.getString("message-id");
            if (givenMessageString) {
                let value = await db.getServerSuggestionChannel(interaction.guild.id)
                let channel = client.channels.cache.get(value);
                let userID = interaction.user.id;
                let udata = await db.getAllUserSuggestions(interaction.guild.id, userID);

                if (udata == null) return interaction.reply(
                    {content: lang.suggest_none, ephemeral: true}
                )

                //console.log(udata);
                let messageIdArray = udata.map(x => x.message_id);


                let givenMessageID = "";

                if (givenMessageString.includes("/")) {
                    givenMessageID = givenMessageString.split("/")[6];
                } else {
                    givenMessageID = givenMessageString;
                }

                if (!messageIdArray.includes(givenMessageID)) return interaction.reply(
                    {content: lang.suggest_none_found, ephemeral: true}
                );

                // log an error whilst getting the message
                let message = await channel.messages.fetch(givenMessageID.toString())
                    .catch(err => {
                        interaction.reply(
                            {content: lang.suggest_none_found, ephemeral: true}
                        )
                        return false;
                    });

                if (message === false) {
                    return;
                } else {
                    // content is the suggestion
                    const content = message.embeds[0].description;
                    // create a modal
                    const modal = new modals.Modal()
                        .setCustomId('edit')
                        .setTitle(lang.suggest_edit_title)
                        .addComponents(
                            new modals.TextInputComponent()
                                .setCustomId('message-id')
                                .setLabel(lang.suggest_edit_message_id)
                                .setStyle('SHORT')
                                .setMinLength(10)
                                .setMaxLength(256)
                                .setDefaultValue(givenMessageID.toString())
                                .setRequired(true),
                            new modals.TextInputComponent()
                                .setCustomId('input')
                                .setLabel(lang.suggestion_name)
                                .setPlaceholder(lang.add_suggestion_here)
                                .setStyle('LONG')
                                .setMinLength(3)
                                .setMaxLength(1024)
                                .setDefaultValue(content)
                                .setRequired(true)
                        );

                    let modalData = await modals.showModal(modal, {
                        client: client,
                        interaction: interaction
                    });
                    modalData;
                }
            } else {
                // create a modal
                    const modal = new modals.Modal()
                        .setCustomId('edit')
                        .setTitle(lang.suggest_edit_title)
                        .addComponents(
                            new modals.TextInputComponent()
                                .setCustomId('message-id')
                                .setLabel(lang.suggest_edit_message_id)
                                .setStyle('SHORT')
                                .setMinLength(10)
                                .setMaxLength(256)
                                .setRequired(true),
                            new modals.TextInputComponent()
                                .setCustomId('input')
                                .setLabel(lang.suggestion_name)
                                .setPlaceholder(lang.add_suggestion_here)
                                .setStyle('LONG')
                                .setMinLength(3)
                                .setMaxLength(1024)
                                .setRequired(true)
                        );

                    let modalData = await modals.showModal(modal, {
                        client: client,
                        interaction: interaction
                    });
                    modalData;
            }


        } catch (e) {
            Logger.error(e);
            console.log(e);
            console.log(e.stack);
        }
    }
}
