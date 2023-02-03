//Import Modules
const ee = require(`../../botconfig/embed.json`);
const {onCoolDown, replacemsg} = require("../../handlers/functions");
const Discord = require("discord.js");
const db = require("../../../database");

module.exports = (client, interaction) => {
    const CategoryName = interaction.commandName;
    let command = false;
    try {
        if (
            client.slashCommands.has(
                CategoryName + interaction.options.getSubcommand()
            )
        ) {
            command = client.slashCommands.get(
                CategoryName + interaction.options.getSubcommand()
            );
        }
    } catch {
        if (client.slashCommands.has("normal" + CategoryName)) {
            command = client.slashCommands.get("normal" + CategoryName);
        }
    }
    if (command) {
        //execute the Command
        command.run(client, interaction, interaction.member, interaction.guild);
    }
    if (interaction.isButton()) return buttons(interaction);

    if (interaction.type.toString() === "MODAL_SUBMIT")
        return modalSubmit(client, interaction);
};

async function confirmRevote(interaction, lang) {
    let edata = db.getServerEmbedData(interaction.guild?.id);
    let dicon = "👎";
    let uicon = "👍";
    if (edata !== null) {
        dicon = edata["downvote_emoji"];
        uicon = edata["upvote_emoji"];
    }

    await interaction.followUp({
        content: lang.already_voted_rechoice,
        components: [
            new Discord.MessageActionRow().addComponents(
                new Discord.MessageButton()
                    .setCustomId("up-rechoice")
                    .setStyle("SUCCESS")
                    .setLabel(lang.suggest_upvote)
                    .setEmoji(`${uicon}`),
                new Discord.MessageButton()
                    .setCustomId("down-rechoice")
                    .setStyle("DANGER")
                    .setLabel(lang.suggest_downvote)
                    .setEmoji(`${dicon}`)
            ),
        ],
        ephemeral: true,
    });
}

/**
 *
 * @param {Discord.interaction} interaction
 */
async function buttons(interaction) {

    await interaction.deferUpdate().catch(() => {
    });

    const language = db.getServerLanguage(interaction.guild?.id)
    const lang = require(`../../botconfig/languages/${language}.json`);
    let edata = db.getServerEmbedData(interaction.guild?.id);
    let dicon = "👎";
    let ecolor = "2C2F33";
    let uicon = "👍";
    if (edata !== null) {
        dicon = edata["downvote_emoji"];
        ecolor = edata["suggestion_embed_color"];
        uicon = edata["upvote_emoji"];
    }


    switch (interaction.customId) {
        case "up": {
            let message = interaction.message;
            let embed = message.embeds[0];
            let dater = `${new Date().getFullYear()}/${new Date().getMonth()}/${new Date().getDay()} ${new Date().getHours()}:${new Date().getMinutes()}:${new Date().getSeconds()}`;
            let value = {user: interaction.user, date: dater};
            let newNumber = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) + 1;
            let voter = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
            if (voter["upvoters"].includes(interaction.user.id)) {
                if (!voter["re_voters"].includes(interaction.user.id)) {
                    await confirmRevote(interaction, lang);
                    return;
                } else {
                    await interaction.followUp({
                        content: lang.already_voted_again,
                        ephemeral: true,
                    });
                    return;
                }
            }
            let editedEmbed = {
                author: embed.author,
                color: embed.color,
                timestamp: embed.timestamp,
                footer: embed.footer,
                description: embed.description,
                fields: [
                    {
                        name: uicon + " " + lang.suggest_upvotes,
                        value: `\`\`\`\n${newNumber}\`\`\``,
                        inline: true,
                    },
                    embed.fields[1],
                ],
            };
            await db.addSuggestionUpvote(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString());
            await message.edit({
                components: message.components,
                embeds: [editedEmbed],
            });
        }
            break;

        case "down": {
            // logger.info(`${interaction.member.user.tag} used ${interaction.commandName}`, "info");
            let message = interaction.message;
            let embed = message.embeds[0];
            let newNumber = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) + 1;
            let voter = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
            if (voter["downvoters"].includes(interaction.user.id)) {
                if (!voter["re_voters"].includes(interaction.user.id)) {
                    await confirmRevote(interaction, lang);
                    return;
                } else {
                    await interaction.followUp({
                        content: lang.already_voted_again,
                        ephemeral: true,
                    });
                    return;
                }
            }
            let editedEmbed = {
                author: embed.author,
                color: embed.color,
                timestamp: embed.timestamp,
                footer: embed.footer,
                description: embed.description,
                fields: [
                    embed.fields[0],
                    {
                        name: dicon + " " + lang.suggest_downvotes,
                        value: `\`\`\`\n${newNumber}\`\`\``,
                        inline: true,
                    },
                ],
            };
            await db.addSuggestionDownvote(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString());
            await message.edit({
                components: message.components,
                embeds: [editedEmbed],
            });
        }
            break;

        case "up-rechoice": {
            let message = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
            let embed = message.embeds[0];
            let newNumber = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) - 1;
            let newNumber1 = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) + 1;
            let voters = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
            if (
                !voters["re_voters"].includes(interaction.user.id)
            ) {
                if (
                    voters["upvoters"].includes(interaction.user.id)
                ) {
                    await interaction.followUp({
                        content: lang.already_voted_option,
                        ephemeral: true,
                    });
                    return;
                } else if (
                    voters["downvoters"].includes(interaction.user.id)
                ) {
                    await db.addSuggestionDownvoteRevoteUp(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString());
                    let editedEmbed = {
                        author: embed.author,
                        color: embed.color,
                        timestamp: embed.timestamp,
                        footer: embed.footer,
                        description: embed.description,
                        fields: [
                            {
                                name: uicon + " " + lang.suggest_upvotes,
                                value: `\`\`\`\n${newNumber1}\`\`\``,
                                inline: true,
                            },
                            {
                                name: dicon + " " + lang.suggest_downvotes,
                                value: `\`\`\`\n${newNumber}\`\`\``,
                                inline: true,
                            },
                        ],
                    };
                    await message.edit({
                        components: message.components,
                        embeds: [editedEmbed],
                    });
                    await interaction.followUp({
                        content: lang.revote_success,
                        ephemeral: true,
                    });
                    return;
                } else {
                    await interaction.followUp({
                        content: lang.already_voted,
                        ephemeral: true,
                    });
                    return;
                }
            } else {
                await interaction.followUp({
                    content: lang.already_voted_again,
                    ephemeral: true,
                });
                return;
            }
        }

        case "down-rechoice": {
            let message = await interaction.message.channel.messages.fetch(interaction.message.reference.messageId);
            let embed = message.embeds[0];
            let newNumber = Number(embed.fields[1].value.split("```\n")[1].split("```")[0]) + 1;
            let newNumber1 = Number(embed.fields[0].value.split("```\n")[1].split("```")[0]) - 1;
            let voters = await db.getSuggestionVoters(message.guild.id.toString(), message.id.toString());
            if (
                !voters["re_voters"].includes(interaction.user.id)
            ) {
                if (
                    voters["downvoters"].includes(interaction.user.id)
                ) {
                    await interaction.followUp({
                        content: lang.already_voted_option,
                        ephemeral: true,
                    });
                    return;
                } else if (
                    voters["upvoters"].includes(interaction.user.id)
                ) {
                    await db.addSuggestionUpvoteRevoteDown(message.guild.id.toString(), message.id.toString(), interaction.user.id.toString());
                    let editedEmbed = {
                        author: embed.author,
                        color: embed.color,
                        timestamp: embed.timestamp,
                        footer: embed.footer,
                        description: embed.description,
                        fields: [
                            {
                                name: uicon + " " + lang.suggest_upvotes,
                                value: `\`\`\`\n${newNumber1}\`\`\``,
                                inline: true,
                            },
                            {
                                name: dicon + " " + lang.suggest_downvotes,
                                value: `\`\`\`\n${newNumber}\`\`\``,
                                inline: true,
                            },
                        ],
                    };
                    await message.edit({
                        components: message.components,
                        embeds: [editedEmbed],
                    });
                    await interaction.followUp({
                        content: lang.revote_success,
                        ephemeral: true,
                    });
                    return;
                } else {
                    await interaction.followUp({
                        content: lang.already_voted,
                        ephemeral: true,
                    });
                    return;
                }
            } else {
                await interaction.followUp({
                    content: lang.already_voted_again,
                    ephemeral: true,
                });
                return;
            }
        }

        case "info": {
            let voters = await db.getSuggestionVoters(interaction.guild.id.toString(), interaction.message.id.toString());
            interaction.followUp({content: voters, ephemeral: true});
        }
            break;

        case "accepted": {
            await interaction.followUp({
                content: lang.already_accepted,
                ephemeral: true,
            });
        }
            break;

        case "rejected": {
            await interaction.followUp({
                content: lang.already_declined,
                ephemeral: true,
            });
        }
            break;

        default:
            break;
    }
}

async function modalSubmit(client, modal) {
    if (modal.customId === "send") {
        let res = modal.fields.getTextInputValue("input");
        let value = await db.getServerSuggestionChannel(modal.guild?.id);
        let channel = client.channels.cache.get(value);
        const badlinks = ["https://", "http://", "www."];
        const nitroscam = [
            "free",
            "nitro",
            "steam",
            "airdrop",
            "gift",
            "minecraft",
            "epic",
            "tiktok", // somehow servers with TikTok etc. in their name are still getting advertised
        ];
        const serverdata = await db.getAllServerSettings(modal.guild?.id);
        let language = serverdata.language;
        if (language == null) {
            language = "lang_en";
        }
        const lang = require(`../../botconfig/languages/${language}.json`);

        // too lazy to make this better, sorry
        let dicon;
        let ecolor;
        let uicon;
        if (serverdata["suggestion_embed_color"] !== null && serverdata["suggestion_embed_color"] !== undefined && serverdata["suggestion_embed_color"] !== "")
        {
            ecolor = serverdata["suggestion_embed_color"];
        } else {
            ecolor = "2C2F33";
        }
        if (serverdata["upvote_emoji"] !== null && serverdata["upvote_emoji"] !== undefined && serverdata["upvote_emoji"] !== "") {
            uicon = serverdata["upvote_emoji"];
        } else {
            uicon = "👍";
        }
        if (serverdata["downvote_emoji"] !== null && serverdata["downvote_emoji"] !== undefined && serverdata["downvote_emoji"] !== "") {
            dicon = serverdata["downvote_emoji"];
        } else {
            dicon = "👎";
        }

        //Removes bad links
        let allowlinks = await db.getServerAllowsLinks(modal.guild?.id);
        if (badlinks.some((el) => res.includes(el)) === true && allowlinks !== true) {
            modal.reply({content: lang.suggest_badlink, ephemeral: true});
            return;
        }

        //Removes nitro scams
        try {
            if (
                res.match(/\b\w+\b/g).filter((word) => nitroscam.includes(word))
                    .length > 1
            ) {
                modal.reply({content: lang.suggest_badlink, ephemeral: true});
                return;
            }
        } catch (error) {
            //logger.error(error);
            modal.reply({content: lang.suggest_badlink, ephemeral: true});
            return;
        }

        //Message for channel not being set
        if (!channel)
            return modal.reply({
                content: lang.suggest_channel_not_set,
                ephemeral: true,
            });

        //Sends message to confirm the suggestion
        modal.reply({content: lang.suggest_sent, ephemeral: true});
        channel
            .send({
                embeds: [
                    {
                        author: {
                            name: modal.user.username,
                            iconURL: modal.user.avatarURL({dynamic: true}),
                        },
                        color: ecolor,
                        timestamp: new Date(),
                        footer: {
                            iconURL: modal.guild?.iconURL({dynamic: true}),
                            text: modal.guild?.name,
                        },
                        description: res,
                        fields: [
                            {
                                name: uicon + " " + lang.suggest_upvotes,
                                value: "```\n0```",
                                inline: true,
                            },
                            {
                                name: dicon + " " + lang.suggest_downvotes,
                                value: "```\n0```",
                                inline: true,
                            },
                        ],
                    },
                ],
                components: [
                    new Discord.MessageActionRow().addComponents(
                        new Discord.MessageButton()
                            .setCustomId("up")
                            .setStyle("SUCCESS")
                            .setLabel(lang.suggest_upvote)
                            .setEmoji(`${uicon}`),
                        new Discord.MessageButton()
                            .setCustomId("down")
                            .setStyle("DANGER")
                            .setLabel(lang.suggest_downvote)
                            .setEmoji(`${dicon}`)
                    ),
                ],
            })
            .then(async (message) => {
                await db.addNewSuggestion(modal.guild?.id, message.id, modal.user.id);
            });
    }
}