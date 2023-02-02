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

const getLanguage = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT language FROM servers WHERE server_id = ?`,
            [guildId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) {
                        resolve("en");
                    } else {
                        resolve(results[0]);
                    }
                }
            }
        );
    });
}

const getAllSettings = async (guildId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `SELECT * FROM servers WHERE server_id = ?`,
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

const setServerLanguage = async (guildId, language) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET language = ? WHERE server_id = ?`,
            [language, guildId],
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

const setServerManagerRole = async (guildId, roleId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET manager_role = ? WHERE server_id = ?`,
            [roleId, guildId],
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

const setServerUpvoteEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET upvote_emoji = ? WHERE server_id = ?`,
            [emoji, guildId],
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

const setServerDownvoteEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET downvote_emoji = ? WHERE server_id = ?`,
            [emoji, guildId],
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

const setServerSuggestionChannel = async (guildId, channelId) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET suggestion_channel = ? WHERE server_id = ?`,
            [channelId, guildId],
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

const setServerAcceptedEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET accepted_emoji = ? WHERE server_id = ?`,
            [emoji, guildId],
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

const setServerDeniedEmoji = async (guildId, emoji) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET denied_emoji = ? WHERE server_id = ?`,
            [emoji, guildId],
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

const setServerEmbedColor = async (guildId, color) => {
    return new Promise((resolve, reject) => {
        pool.query(
            `UPDATE servers SET suggestion_embed_color = ? WHERE server_id = ?`,
            [color, guildId],
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

const addNewSuggestion = async (guildId, suggestionId, suggestion, authorId) => {
    return new Promise((resolve, reject) => {
        // add a new suggestion to the database only if message_id is not already in the database
        pool.query(
            `INSERT INTO suggestions (server_id, message_id, content, user_id, upvotes, downvotes, upvoters, downvoters, re_voters, creation_date)
             SELECT * FROM (SELECT ? AS server_id, ? AS message_id, ? AS content, ? AS user_id, ? AS upvotes, ? AS downvotes, ? AS upvoters, ? AS downvoters, ? AS re_voters, ? AS creation_date) AS tmp
             WHERE NOT EXISTS (
                     SELECT message_id FROM suggestions WHERE message_id = tmp.message_id
                 ) LIMIT 1;`,
            [guildId, suggestionId, suggestion, authorId, 0, 0, "[]", "[]", "[]", getCurrentDate()],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0) {
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
            `UPDATE suggestions SET upvotes = upvotes + 1, upvoters = JSON_ARRAY_APPEND(upvoters, '$', ?) WHERE server_id = ? AND message_id = ? AND NOT JSON_CONTAINS(upvoters, ?) AND NOT JSON_CONTAINS(downvoters, ?);`,
            [userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0) {
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
            `UPDATE suggestions SET downvotes = downvotes + 1, downvoters = JSON_ARRAY_APPEND(downvoters, '$', ?) WHERE server_id = ? AND message_id = ? AND NOT JSON_CONTAINS(downvoters, ?) AND NOT JSON_CONTAINS(upvoters, ?);`,
            [userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0) {
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
            `UPDATE suggestions SET upvotes = upvotes - 1, downvotes = downvotes + 1, upvoters = JSON_REMOVE(upvoters, JSON_UNQUOTE(JSON_SEARCH(upvoters, 'one', ?))), re_voters = JSON_ARRAY_APPEND(re_voters, '$', ?), downvoters = JSON_ARRAY_APPEND(downvoters, '$', ?) WHERE server_id = ? AND message_id = ? AND JSON_CONTAINS(upvoters, ?) AND NOT JSON_CONTAINS(re_voters, ?);`,
            [userId, userId, userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0) {
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
            `UPDATE suggestions SET downvotes = downvotes - 1, upvotes = upvotes + 1, downvoters = JSON_REMOVE(downvoters, JSON_UNQUOTE(JSON_SEARCH(downvoters, 'one', ?))), re_voters = JSON_ARRAY_APPEND(re_voters, '$', ?), upvoters = JSON_ARRAY_APPEND(upvoters, '$', ?) WHERE server_id = ? AND message_id = ? AND JSON_CONTAINS(downvoters, ?) AND NOT JSON_CONTAINS(re_voters, ?);`,
            [userId, userId, userId, guildId, suggestionId, userId, userId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.affectedRows === 0) {
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
            `SELECT JSON_CONTAINS(upvoters, ?) AS upvoted, JSON_CONTAINS(downvoters, ?) AS downvoted FROM suggestions WHERE server_id = ? AND message_id = ?;`,
            [userId, userId, guildId, suggestionId],
            (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    if (results.length === 0) {
                        resolve(false);
                    } else {
                        if (results[0].upvoted === 1) {
                            resolve("up");
                        } else if (results[0].downvoted === 1) {
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
    getLanguage,
    getAllSettings,
    setServerLanguage,
    setServerManagerRole,
    setServerUpvoteEmoji,
    setServerDownvoteEmoji,
    setServerSuggestionChannel,
    setServerAcceptedEmoji,
    setServerDeniedEmoji,
    setServerEmbedColor,
    addNewSuggestion,
    addSuggestionUpvote,
    addSuggestionDownvote,
    addSuggestionUpvoteRevoteDown,
    addSuggestionDownvoteRevoteUp,
    checkForUserVote


}

