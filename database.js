const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_DATABASE,
    enableKeepAlive: true,
    keepAliveInitialDelay: 20000,
});

const getCurrentDate = () => {
    return new Date().toISOString().slice(0, 19).replace("T", " ");
}

const getServerLanguage = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT language
             FROM servers
             WHERE server_id = ?`,
            [guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0 || results[0]["language"] === null) {
                        resolve("lang_en");
                    } else {
                        resolve(results[0]["language"]);
                    }
                }
            }
        );
    });
}

const getAllServerSettings = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT *
             FROM servers
             WHERE server_id = ?`,
            [guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) {
                        resolve(null);
                    } else {
                        resolve(results[0]);
                    }
                }
            }
        );
    });
}

const getAllUserSuggestions = async (guildId, userId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT *
             FROM suggestions
             WHERE server_id = ?
               AND user_id = ?`,
            [guildId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

const getServerSuggestionChannel = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT CAST(suggestion_channel AS VARCHAR(255)) AS suggestion_channel
             FROM servers
             WHERE server_id = ?`,
            [guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(results);
                    if (results.length === 0 || results[0]["suggestion_channel"] === null) {
                        resolve(null);
                    } else {
                        console.log(results[0]["suggestion_channel"]);
                        resolve(results[0]["suggestion_channel"]);
                    }
                }
            }
        );
    });
}

const getServerEmbedData = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT suggestion_embed_color, upvote_emoji, downvote_emoji
             FROM servers
             WHERE server_id = ?`,
            [guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(null);
                    } else {
                        resolve(results[0]);
                    }
                }
            }
        );
    });
}

const getSuggestionVoters = async (serverId, messageId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT upvoters, downvoters, re_voters
             FROM suggestions
             WHERE server_id = ?
               AND message_id = ?`,
            [serverId, messageId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            }
        );
    });
}

const getServerAllowsLinks = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT allow_links
             FROM servers
             WHERE server_id = ?`,
            [guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(null);
                    } else {
                        if (results[0]["allow_links"] === 1) {
                            resolve(true)
                        } else {
                            resolve(false)
                        }
                    }
                }
            }
        );
    });
}

const setServerLanguage = async (guildId, language) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET language = ?
             WHERE server_id = ?`,
            [language, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, language)
                             VALUES (?, ?)`,
                            [guildId, language],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerManagerRole = async (guildId, roleId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET manager_role = ?
             WHERE server_id = ?`,
            [roleId, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, manager_role)
                             VALUES (?, ?)`,
                            [guildId, roleId],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerUpvoteEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET upvote_emoji = ?
             WHERE server_id = ?`,
            [emoji, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, upvote_emoji)
                             VALUES (?, ?)`,
                            [guildId, emoji],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerDownvoteEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET downvote_emoji = ?
             WHERE server_id = ?`,
            [emoji, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, downvote_emoji)
                             VALUES (?, ?)`,
                            [guildId, emoji],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerSuggestionChannel = async (guildId, channelId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET suggestion_channel = ?
             WHERE server_id = ?`,
            [channelId, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, suggestion_channel)
                             VALUES (?, ?)`,
                            [guildId, channelId],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerAcceptedEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET accepted_emoji = ?
             WHERE server_id = ?`,
            [emoji, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, accepted_emoji)
                             VALUES (?, ?)`,
                            [guildId, emoji],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerDeniedEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET denied_emoji = ?
             WHERE server_id = ?`,
            [emoji, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, denied_emoji)
                             VALUES (?, ?)`,
                            [guildId, emoji],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerEmbedColor = async (guildId, color) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET suggestion_embed_color = ?
             WHERE server_id = ?`,
            [color, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, suggestion_embed_color)
                             VALUES (?, ?)`,
                            [guildId, color],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setServerEmbedSettings = async (guildId, color, downvote, upvote) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers
             SET suggestion_embed_color = ?,
                 downvote_emoji         = ?,
                 upvote_emoji           = ?
             WHERE server_id = ?`,
            [color, downvote, upvote, guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        pool.query(
                            `INSERT INTO servers (server_id, suggestion_embed_color, downvote_emoji, upvote_emoji)
                             VALUES (?, ?, ?, ?)`,
                            [guildId, color, downvote, upvote],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve(true);
                                }
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setSuggestionDenied = async (guildId, suggestionId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET accepted = ?
             WHERE server_id = ?
               AND message_id = ?`,
            [false, guildId, suggestionId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setSuggestionAccepted = async (guildId, suggestionId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET accepted = ?
             WHERE server_id = ?
               AND message_id = ?`,
            [true, guildId, suggestionId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const setSuggestionPending = async (guildId, suggestionId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET accepted = ?
             WHERE server_id = ?
               AND message_id = ?`,
            [null, guildId, suggestionId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const addNewSuggestion = async (guildId, suggestionId, channelId, suggestion, authorId) => {
    return new Promise((resolve, reject) => {
        // add a new suggestion to the database only if message_id is not already in the database
        pool.query(
            `INSERT INTO suggestions (server_id, channel_id, message_id, content, user_id, upvotes, downvotes, upvoters,
                                      downvoters, re_voters, creation_date)
             SELECT *
             FROM (SELECT ? AS server_id,
                          ? AS message_id,
                          ? AS channel_id,
                          ? AS content,
                          ? AS user_id,
                          ? AS upvotes,
                          ? AS downvotes,
                          ? AS upvoters,
                          ? AS downvoters,
                          ? AS re_voters,
                          ? AS creation_date) AS tmp
             WHERE NOT EXISTS(
                     SELECT message_id FROM suggestions WHERE message_id = tmp.message_id
                 )
             LIMIT 1;`,
            [guildId, suggestionId, channelId, suggestion, authorId, 0, 0, "[]", "[]", "[]", getCurrentDate()],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const addSuggestionUpvote = async (guildId, suggestionId, userId) => {
    // add a new upvote to the suggestion only if the user has not already upvoted it
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET upvotes  = upvotes + 1,
                 upvoters = JSON_ARRAY_APPEND(IFNULL(upvoters, '[]'), '$', ?)
             WHERE server_id = ?
               AND message_id = ?
               AND NOT JSON_CONTAINS(upvoters, ?)
               AND NOT JSON_CONTAINS(downvoters, ?);`,
            [userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log(results);
                    console.log(userId);
                    console.log(guildId);
                    console.log(suggestionId);
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const addSuggestionDownvote = async (guildId, suggestionId, userId) => {
    // add a new downvote to the suggestion only if the user has not already downvoted or upvoted it
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET downvotes  = downvotes + 1,
                 downvoters = JSON_ARRAY_APPEND(downvoters, '$', ?)
             WHERE server_id = ?
               AND message_id = ?
               AND NOT JSON_CONTAINS(downvoters, ?)
               AND NOT JSON_CONTAINS(upvoters, ?);`,
            [userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const addSuggestionUpvoteRevoteDown = async (guildId, suggestionId, userId) => {
    // remove the upvote from the suggestion and append it to the re_voters column if the user has already upvoted it
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET upvotes    = upvotes - 1,
                 downvotes  = downvotes + 1,
                 upvoters   = JSON_REMOVE(upvoters, JSON_UNQUOTE(JSON_SEARCH(upvoters, 'one', ?))),
                 re_voters  = JSON_ARRAY_APPEND(re_voters, '$', ?),
                 downvoters = JSON_ARRAY_APPEND(downvoters, '$', ?)
             WHERE server_id = ?
               AND message_id = ?
               AND JSON_CONTAINS(upvoters, ?)
               AND NOT JSON_CONTAINS(re_voters, ?);`,
            [userId, userId, userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const addSuggestionDownvoteRevoteUp = async (guildId, suggestionId, userId) => {
    // remove the downvote from the suggestion and append it to the re_voters column if the user has already downvoted it
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE suggestions
             SET downvotes  = downvotes - 1,
                 upvotes    = upvotes + 1,
                 downvoters = JSON_REMOVE(downvoters, JSON_UNQUOTE(JSON_SEARCH(downvoters, 'one', ?))),
                 re_voters  = JSON_ARRAY_APPEND(re_voters, '$', ?),
                 upvoters   = JSON_ARRAY_APPEND(upvoters, '$', ?)
             WHERE server_id = ?
               AND message_id = ?
               AND JSON_CONTAINS(downvoters, ?)
               AND NOT JSON_CONTAINS(re_voters, ?);`,
            [userId, userId, userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0 || results.affectedRows === undefined) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                }
            }
        );
    });
}

const checkForUserVote = async (guildId, suggestionId, userId) => {
    // get the user's vote on the suggestion
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT JSON_CONTAINS(upvoters, ?) AS upvoted, JSON_CONTAINS(downvoters, ?) AS downvoted
             FROM suggestions
             WHERE server_id = ?
               AND message_id = ?;`,
            [userId, userId, guildId, suggestionId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) {
                        resolve(false);
                    } else {
                        const {downvoted, upvoted} = results[0];
                        if (upvoted === 1) {
                            resolve("up");
                        } else if (downvoted === 1) {
                            resolve("down");
                        } else {
                            resolve(false);
                        }
                    }
                }
            }
        );
    });
}


module.exports = {
    pool,
    getCurrentDate,
    getServerLanguage,
    getAllServerSettings,
    getAllUserSuggestions,
    getServerSuggestionChannel,
    getServerEmbedData,
    getSuggestionVoters,
    getServerAllowsLinks,

    setServerLanguage,
    setServerManagerRole,
    setServerUpvoteEmoji,
    setServerDownvoteEmoji,
    setServerSuggestionChannel,
    setServerAcceptedEmoji,
    setServerDeniedEmoji,
    setServerEmbedColor,
    setServerEmbedSettings,
    setSuggestionDenied,
    setSuggestionAccepted,
    setSuggestionPending,

    addNewSuggestion,
    addSuggestionUpvote,
    addSuggestionDownvote,
    addSuggestionUpvoteRevoteDown,
    addSuggestionDownvoteRevoteUp,

    checkForUserVote


}

