const {readdirSync, lstatSync} = require("fs");
const {SlashCommandBuilder} = require('@discordjs/builders');
const config = require("../botconfig/config.json");
const Logger = require("../../logger");
const dirSetup = config.slashCommandsDirs;
const serverDirSetup = config.slashCommandsServerDirs;
module.exports = (client) => {
    try {
        let allCommands = [];
        readdirSync("./bot/slashCommands/").forEach((dir) => {
            if (lstatSync(`./bot/slashCommands/${dir}`).isDirectory()) {
                const groupName = dir;
                const cmdSetup = dirSetup.find(d => d.Folder == dir);
                //If its a valid cmdsetup
                if (cmdSetup && cmdSetup.Folder) {
                    //Set the SubCommand as a Slash Builder
                    const subCommand = new SlashCommandBuilder().setName(String(cmdSetup.CmdName).replace(/\s+/g, '_').toLowerCase()).setDescription(String(cmdSetup.CmdDescription)).setDefaultPermission(cmdSetup.activeByDefault);
                    //Now for each file in that subcommand, add a command!
                    const slashCommands = readdirSync(`./bot/slashCommands/${dir}/`).filter((file) => file.endsWith(".js"));
                    for (let file of slashCommands) {
                        let pull = require(`../slashCommands/${dir}/${file}`);
                        if (pull.name && pull.description) {
                            subCommand
                                .addSubcommand((subcommand) => {
                                    subcommand.setName(String(pull.name).toLowerCase()).setDescription(pull.description)
                                    if (pull.options && pull.options.length > 0) {
                                        for (const option of pull.options) {
                                            if (option.User && option.User.name && option.User.description) {
                                                subcommand.addUserOption((op) =>
                                                    op.setName(String(option.User.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.User.description).setRequired(option.User.required)
                                                )
                                            } else if (option.Integer && option.Integer.name && option.Integer.description) {
                                                subcommand.addIntegerOption((op) =>
                                                    op.setName(String(option.Integer.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Integer.description).setRequired(option.Integer.required)
                                                )
                                            } else if (option.String && option.String.name && option.String.description) {
                                                subcommand.addStringOption((op) =>
                                                    op.setName(String(option.String.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.String.description).setRequired(option.String.required)
                                                )
                                            } else if (option.Channel && option.Channel.name && option.Channel.description) {
                                                subcommand.addChannelOption((op) =>
                                                    op.setName(String(option.Channel.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Channel.description).setRequired(option.Channel.required)
                                                )
                                            } else if (option.Role && option.Role.name && option.Role.description) {
                                                subcommand.addRoleOption((op) =>
                                                    op.setName(String(option.Role.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Role.description).setRequired(option.Role.required)
                                                )
                                            } else if (option.StringChoices && option.StringChoices.name && option.StringChoices.description && option.StringChoices.choices && option.StringChoices.choices.length > 0) {
                                                subcommand.addStringOption((op) =>
                                                    op.setName(String(option.StringChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.StringChoices.description).setRequired(option.StringChoices.required)
                                                        .addChoices(option.StringChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), String(c[1])])),
                                                )
                                            } else if (option.IntChoices && option.IntChoices.name && option.IntChoices.description && option.IntChoices.choices && option.IntChoices.choices.length > 0) {
                                                subcommand.addStringOption((op) =>
                                                    op.setName(String(option.IntChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.IntChoices.description).setRequired(option.IntChoices.required)
                                                        .addChoices(option.IntChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), parseInt(c[1])])),
                                                )
                                            } else {
                                                Logger.warn(`A Option is missing the Name and/or the Description of ${pull.name}`);
                                            }
                                        }
                                    }
                                    return subcommand;
                                })
                            client.slashCommands.set(String(cmdSetup.CmdName).replace(/\s+/g, '_').toLowerCase() + pull.name, pull)
                        } else {
                            Logger.error(`Missing a help.name, or help.name is not a string.`, file);

                        }
                    }
                    //add the subcommand to the array
                    allCommands.push(subCommand.toJSON());
                } else {
                    return Logger.error(`The Subcommand-Folder ${dir} is not in the dirSetup Configuration! You can set it in /src/botconfig/config.json`, "");
                }
            } else {
                let pull = require(`../slashCommands/${dir}`);
                if (pull.name && pull.description) {
                    let Command = new SlashCommandBuilder().setName(String(pull.name).toLowerCase()).setDescription(pull.description)//.setDefaultMemberPermissions(pull.memberpermissions).setDMPermission(pull.dmpermission).setCooldown(pull.cooldown);
                    if (pull.options && pull.options.length > 0) {
                        for (const option of pull.options) {
                            if (option.User && option.User.name && option.User.description) {
                                Command.addUserOption((op) =>
                                    op.setName(String(option.User.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.User.description).setRequired(option.User.required)
                                )
                            } else if (option.Integer && option.Integer.name && option.Integer.description) {
                                Command.addIntegerOption((op) =>
                                    op.setName(String(option.Integer.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Integer.description).setRequired(option.Integer.required)
                                )
                            } else if (option.String && option.String.name && option.String.description) {
                                Command.addStringOption((op) =>
                                    op.setName(String(option.String.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.String.description).setRequired(option.String.required)
                                )
                            } else if (option.Channel && option.Channel.name && option.Channel.description) {
                                Command.addChannelOption((op) =>
                                    op.setName(String(option.Channel.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Channel.description).setRequired(option.Channel.required)
                                )
                            } else if (option.Role && option.Role.name && option.Role.description) {
                                Command.addRoleOption((op) =>
                                    op.setName(String(option.Role.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Role.description).setRequired(option.Role.required)
                                )
                            } else if (option.StringChoices && option.StringChoices.name && option.StringChoices.description && option.StringChoices.choices && option.StringChoices.choices.length > 0) {
                                Command.addStringOption((op) =>
                                    op.setName(String(option.StringChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.StringChoices.description).setRequired(option.StringChoices.required)
                                        .addChoices(option.StringChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), String(c[1])])),
                                )
                            } else if (option.IntChoices && option.IntChoices.name && option.IntChoices.description && option.IntChoices.choices && option.IntChoices.choices.length > 0) {
                                Command.addStringOption((op) =>
                                    op.setName(String(option.IntChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.IntChoices.description).setRequired(option.IntChoices.required)
                                        .addChoices(option.IntChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), parseInt(c[1])])),
                                )
                            } else {
                                Logger.error(`A Option is missing the Name and/or the Description of ${pull.name}`, "");
                            }
                        }
                    }
                    allCommands.push(Command.toJSON());
                    client.slashCommands.set("normal" + pull.name, pull)
                } else {
                    Logger.error(`Missing a help.name, or help.name is not a string.`, file);
                }
            }
        });

        let mainServerOnlyCommands = [];
        readdirSync("./bot/guildSlashCommands/").forEach((dir) => {
            if (lstatSync(`./bot/guildSlashCommands/${dir}`).isDirectory()) {
                const groupName = dir;
                const mainCmdSetup = serverDirSetup.find(d => d.Folder == dir);
                //If its a valid cmdsetup
                if (mainCmdSetup && mainCmdSetup.Folder) {
                    //Set the SubCommand as a Slash Builder
                    const subCommand = new SlashCommandBuilder().setName(String(mainCmdSetup.CmdName).replace(/\s+/g, '_').toLowerCase()).setDescription(String(mainCmdSetup.CmdDescription)).setDefaultPermission(mainCmdSetup.activeByDefault);
                    //Now for each file in that subcommand, add a command!
                    const slashCommands = readdirSync(`./bot/guildSlashCommands/${dir}/`).filter((file) => file.endsWith(".js"));
                    for (let file of slashCommands) {
                        let pull = require(`../guildSlashCommands/${dir}/${file}`);
                        if (pull.name && pull.description) {
                            subCommand
                                .addSubcommand((subcommand) => {
                                    subcommand.setName(String(pull.name).toLowerCase()).setDescription(pull.description)
                                    if (pull.options && pull.options.length > 0) {
                                        for (const option of pull.options) {
                                            if (option.User && option.User.name && option.User.description) {
                                                subcommand.addUserOption((op) =>
                                                    op.setName(String(option.User.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.User.description).setRequired(option.User.required)
                                                )
                                            } else if (option.Integer && option.Integer.name && option.Integer.description) {
                                                subcommand.addIntegerOption((op) =>
                                                    op.setName(String(option.Integer.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Integer.description).setRequired(option.Integer.required)
                                                )
                                            } else if (option.String && option.String.name && option.String.description) {
                                                subcommand.addStringOption((op) =>
                                                    op.setName(String(option.String.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.String.description).setRequired(option.String.required)
                                                )
                                            } else if (option.Channel && option.Channel.name && option.Channel.description) {
                                                subcommand.addChannelOption((op) =>
                                                    op.setName(String(option.Channel.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Channel.description).setRequired(option.Channel.required)
                                                )
                                            } else if (option.Role && option.Role.name && option.Role.description) {
                                                subcommand.addRoleOption((op) =>
                                                    op.setName(String(option.Role.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Role.description).setRequired(option.Role.required)
                                                )
                                            } else if (option.StringChoices && option.StringChoices.name && option.StringChoices.description && option.StringChoices.choices && option.StringChoices.choices.length > 0) {
                                                subcommand.addStringOption((op) =>
                                                    op.setName(String(option.StringChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.StringChoices.description).setRequired(option.StringChoices.required)
                                                        .addChoices(option.StringChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), String(c[1])])),
                                                )
                                            } else if (option.IntChoices && option.IntChoices.name && option.IntChoices.description && option.IntChoices.choices && option.IntChoices.choices.length > 0) {
                                                subcommand.addStringOption((op) =>
                                                    op.setName(String(option.IntChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.IntChoices.description).setRequired(option.IntChoices.required)
                                                        .addChoices(option.IntChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), parseInt(c[1])])),
                                                )
                                            } else {
                                                Logger.warn(`A Option is missing the Name and/or the Description of ${pull.name}`);
                                            }
                                        }
                                    }
                                    return subcommand;
                                })
                            client.slashCommands.set(String(mainCmdSetup.CmdName).replace(/\s+/g, '_').toLowerCase() + pull.name, pull)
                        } else {
                            Logger.error(`Missing a help.name, or help.name is not a string.`, file);

                        }
                    }
                    //add the subcommand to the array
                    mainServerOnlyCommands.push(subCommand.toJSON());
                } else {
                    return Logger.error(`The Subcommand-Folder ${dir} is not in the serverDirSetup Configuration! You can set it in /src/botconfig/config.json`, "");
                }
            } else {
                let pull = require(`../guildSlashCommands/${dir}`);
                if (pull.name && pull.description) {
                    let Command = new SlashCommandBuilder().setName(String(pull.name).toLowerCase()).setDescription(pull.description)//.setDefaultMemberPermissions(pull.memberpermissions).setDMPermission(pull.dmpermission).setCooldown(pull.cooldown);
                    if (pull.options && pull.options.length > 0) {
                        for (const option of pull.options) {
                            if (option.User && option.User.name && option.User.description) {
                                Command.addUserOption((op) =>
                                    op.setName(String(option.User.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.User.description).setRequired(option.User.required)
                                )
                            } else if (option.Integer && option.Integer.name && option.Integer.description) {
                                Command.addIntegerOption((op) =>
                                    op.setName(String(option.Integer.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Integer.description).setRequired(option.Integer.required)
                                )
                            } else if (option.String && option.String.name && option.String.description) {
                                Command.addStringOption((op) =>
                                    op.setName(String(option.String.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.String.description).setRequired(option.String.required)
                                )
                            } else if (option.Channel && option.Channel.name && option.Channel.description) {
                                Command.addChannelOption((op) =>
                                    op.setName(String(option.Channel.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Channel.description).setRequired(option.Channel.required)
                                )
                            } else if (option.Role && option.Role.name && option.Role.description) {
                                Command.addRoleOption((op) =>
                                    op.setName(String(option.Role.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.Role.description).setRequired(option.Role.required)
                                )
                            } else if (option.StringChoices && option.StringChoices.name && option.StringChoices.description && option.StringChoices.choices && option.StringChoices.choices.length > 0) {
                                Command.addStringOption((op) =>
                                    op.setName(String(option.StringChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.StringChoices.description).setRequired(option.StringChoices.required)
                                        .addChoices(option.StringChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), String(c[1])])),
                                )
                            } else if (option.IntChoices && option.IntChoices.name && option.IntChoices.description && option.IntChoices.choices && option.IntChoices.choices.length > 0) {
                                Command.addStringOption((op) =>
                                    op.setName(String(option.IntChoices.name).replace(/\s+/g, '_').toLowerCase()).setDescription(option.IntChoices.description).setRequired(option.IntChoices.required)
                                        .addChoices(option.IntChoices.choices.map(c => [String(c[0]).replace(/\s+/g, '_').toLowerCase(), parseInt(c[1])])),
                                )
                            } else {
                                Logger.error(`A Option is missing the Name and/or the Description of ${pull.name}`, "");
                            }
                        }
                    }
                    mainServerOnlyCommands.push(Command.toJSON());
                    client.slashCommands.set("normal" + pull.name, pull)
                } else {
                    Logger.error(`Missing a help.name, or help.name is not a string.`, file);
                }
            }
        });


        //Once the Bot is ready, add all Slas Commands to each guild
        client.on("ready", () => {
            if (process.env.STATE === "production") {
                client.application.commands.set(allCommands)
                    .then(slashCommandsData => {
                        Logger.info(`${slashCommandsData.size} slashCommands (With ${slashCommandsData.map(d => d.options).flat().length} Subcommands) Loaded.`, "");
                    }).catch((e) => Logger.error("An error occured:", e));
            } else {
                client.guilds.cache.map(g => g).forEach((guild) => {
                    try {
                        guild.commands.set(allCommands)
                            .then(slashCommandsData => {
                                Logger.info(`${slashCommandsData.size} slashCommands (With ${slashCommandsData.map(d => d.options).flat().length} Subcommands) Loaded for ${guild.name}.`, "");
                            }).catch((e) => Logger.error("An error occured:", e));
                    } catch (e) {
                        Logger.error("An error occured:", e);
                    }
                });
            }
            // get guild by id (NOT FROM CACHE)
            const mainGuild = client.guilds.cache.get(process.env.MAIN_SERVER_ID);
            if (!mainGuild) {
                Logger.error("Could not load the main Server Commands!", "The main Server (MAIN_SERVER_ID in .env file) is not in the cache!");
            } else {
                mainGuild.commands.set(mainServerOnlyCommands)
                .then(slashCommandsData => {
                    Logger.info(`${slashCommandsData.size} slashCommands (With ${slashCommandsData.map(d => d.options).flat().length} Subcommands) Loaded for main Server "${mainGuild.name}".`, "");
                }).catch((e) => Logger.error("An error occured whlst loading customGuild commands:", e));
            }
        })
        //DISABLE WHEN USING GLOBAL!
        client.on("guildCreate", (guild) => {
            try {
                if (process.env.STATE !== "production") {
                    guild.commands.set(allCommands)
                        .then(slashCommandsData => {
                            Logger.info(`${slashCommandsData.size} slashCommands (With ${slashCommandsData.map(d => d.options).flat().length} Subcommands) Loaded for ${guild.name}.`, "");
                        }).catch((e) => Logger.error("An error occured:", e));
                }
            } catch (e) {
                Logger.error("An error occured:", e);
            }
        })

    } catch (e) {
        Logger.error("An error occured:", e);
    }
};
