const mysql = require('mysql2')

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_DATABASE,
  enableKeepAlive: true,
  keepAliveInitialDelay: 20000,
  bigNumberStrings: true,
  supportBigNumbers: true,
})

const getCurrentDate = () => {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
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
          reject(err)
        } else {
          if (results.length === 0 || results[0]['language'] === null) {
            resolve('lang_en')
          } else {
            resolve(results[0]['language'])
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (results.length === 0) {
            resolve(null)
          } else {
            resolve(results[0])
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          resolve(results)
        }
      }
    )
  })
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
          reject(err)
        } else {
          // console.log(results);
          if (
            results.length === 0 ||
            results[0]['suggestion_channel'] === null
          ) {
            resolve(null)
          } else {
            // console.log(results[0]["suggestion_channel"]);
            resolve(results[0]['suggestion_channel'])
          }
        }
      }
    )
  })
}

const getServerSuggestionChannels = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      // get from channels table the channel_id_array row where server_id = guildId
      `SELECT channel_id_array
       FROM channels
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          // console.log(results);
          if (results.length === 0 || results[0]?.channel_id_array === null) {
            resolve(null)
          } else {
            // console.log(results[0]["channel_id_array"]);
            resolve(JSON.parse(results[0]?.channel_id_array)?.channel_id_array)
          }
        }
      }
    )
  })
}

const getServerEmbedData = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT suggestion_embed_color, upvote_emoji, downvote_emoji, accepted_emoji, denied_emoji
       FROM servers
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        //console.log(results);
        if (err) {
          reject(err)
        } else {
          try {
            if (
              resolve.length === 0 ||
              results[0]['suggestion_embed_color'] === null
            ) {
              resolve(undefined)
            } else {
              resolve(results[0])
            }
          } catch (error) {
            resolve(undefined)
          }
        }
      }
    )
  })
}

const getSuggestionVoters = async (serverId, messageId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT upvoters, downvoters, re_voters, downvotes, upvotes
       FROM suggestions
       WHERE server_id = ?
         AND message_id = ?`,
      [serverId, messageId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(null)
          } else {
            if (results[0]['allow_links'] === 1) {
              resolve(true)
            } else {
              resolve(false)
            }
          }
        }
      }
    )
  })
}

const getAcceptUpvotes = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT auto_accept_upvotes
       FROM servers
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0]?.auto_accept_upvotes)
        }
      }
    )
  })
}

const getDeclineDownvotes = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT auto_decline_downvotes
       FROM servers
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0]?.auto_decline_downvotes)
        }
      }
    )
  })
}

const getNumberOfSuggestions = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT COUNT(*)
       FROM suggestions`,
      [],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0]['COUNT(*)'])
        }
      }
    )
  })
}

const getNumberOfSuggestionsInGuild = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT COUNT(*)
       FROM suggestions
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0]['COUNT(*)'])
        }
      }
    )
  })
}

const getGuildsWithMostSuggestions = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT server_id, COUNT(*)
       FROM suggestions
       GROUP BY server_id
       ORDER BY COUNT(*) DESC
       LIMIT 3`,
      [],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      }
    )
  })
}

const getServerAutoThread = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT auto_thread
       FROM servers
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (results[0]?.auto_thread?.toString() === '1') {
            resolve(true)
          } else {
            resolve(false)
          }
        }
      }
    )
  })
}

const getSuggestionThread = async (guildId, messageId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT thread_id
       FROM suggestions
       WHERE server_id = ?
         AND message_id = ?`,
      [guildId, messageId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0]?.thread_id)
        }
      }
    )
  })
}

const getServerSuggestionsSortedByUpvotes = async (guildId, amount) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT message_id, upvotes, downvotes, content, channel_id
       FROM suggestions
       WHERE server_id = ?
       ORDER BY upvotes DESC
       LIMIT ?`,
      [guildId, amount],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results)
        }
      }
    )
  })
}

const getSuggestMessage = async (channelId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT message_id
       FROM suggest_message_ids
       WHERE channel_id = ?`,
      [channelId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(results[0]?.message_id)
        }
      }
    )
  })
}

const getServerMaxChannels = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT max_channels
       FROM server_max_channels
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          let channels = results[0]?.max_channels
          if (channels === undefined) {
            channels = 2
          } else {
            channels = parseInt(channels)
          }
          resolve(channels)
        }
      }
    )
  })
}

const setServerLanguage = async (guildId, language) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE servers
       SET language = ?
       WHERE server_id = ?`,
      [language, guildId],
      (err, results) => {
        //console.log(results);
        //console.log(err);
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, language)
               VALUES (?, ?)`,
              [guildId, language],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, manager_role)
               VALUES (?, ?)`,
              [guildId, roleId],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, upvote_emoji)
               VALUES (?, ?)`,
              [guildId, emoji],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, downvote_emoji)
               VALUES (?, ?)`,
              [guildId, emoji],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, suggestion_channel)
               VALUES (?, ?)`,
              [guildId, channelId],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setServerSuggestionChannels = async (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    if (channelId == null) {
      // drop the row
      pool.query(
        `DELETE
         FROM channels
         WHERE server_id = ?`,
        [guildId],
        (err) => {
          if (err) {
            reject(err)
          } else {
            resolve(true)
          }
        }
      )
      resolve(true)
    }
    pool.query(
      `UPDATE channels
       SET channel_id_array = ?
       WHERE server_id = ?`,
      [JSON.stringify(channelId), guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO channels (server_id, channel_id_array)
               VALUES (?, ?)`,
              [guildId, JSON.stringify(channelId)],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, accepted_emoji)
               VALUES (?, ?)`,
              [guildId, emoji],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, denied_emoji)
               VALUES (?, ?)`,
              [guildId, emoji],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, suggestion_embed_color)
               VALUES (?, ?)`,
              [guildId, color],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setServerEmbedSettings = async (
  guildId,
  color,
  downvote,
  upvote,
  accept,
  decline
) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE servers
       SET suggestion_embed_color = ?,
           downvote_emoji         = ?,
           upvote_emoji           = ?,
           accepted_emoji         = ?,
           denied_emoji           = ?
       WHERE server_id = ?`,
      [color, downvote, upvote, accept, decline, guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, suggestion_embed_color, downvote_emoji, upvote_emoji,
                                    accepted_emoji, denied_emoji)
               VALUES (?, ?, ?, ?, ?, ?)`,
              [guildId, color, downvote, upvote, accept, decline],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setServerAutoAccept = async (guildId, autoAccept) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE servers
       SET auto_accept_upvotes = ?
       WHERE server_id = ?`,
      [autoAccept, guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, auto_accept_upvotes)
               VALUES (?, ?)`,
              [guildId, autoAccept],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setServerAutoDecline = async (guildId, autoDecline) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE servers
       SET auto_decline_downvotes = ?
       WHERE server_id = ?`,
      [autoDecline, guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, auto_decline_downvotes)
               VALUES (?, ?)`,
              [guildId, autoDecline],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setServerAutoThread = async (guildId, autoThread) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE servers
       SET auto_thread = ?
       WHERE server_id = ?`,
      [autoThread, guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO servers (server_id, auto_thread)
               VALUES (?, ?)`,
              [guildId, autoThread],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setSuggestionThread = async (suggestionId, threadId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE suggestions
       SET thread_id = ?
       WHERE message_id = ?`,
      [threadId, suggestionId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setSuggestMessage = async (channelId, messageId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE suggest_message_ids
       SET message_id = ?
       WHERE channel_id = ?`,
      [messageId, channelId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO suggest_message_ids (message_id, channel_id)
               VALUES (?, ?)`,
              [messageId, channelId],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setDeleteSuggestion = async (guildId, deleteSuggestion) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE
       FROM suggestions
       WHERE server_id = ?
         AND message_id = ?`,
      [guildId, deleteSuggestion],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const setServerMaxChannels = async (guildId, maxChannels) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `UPDATE server_max_channels
       SET max_channels = ?
       WHERE server_id = ?`,
      [maxChannels, guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            pool.query(
              `INSERT INTO server_max_channels (server_id, max_channels)
               VALUES (?, ?)`,
              [guildId, maxChannels],
              (err) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const addNewSuggestion = async (
  guildId,
  suggestionId,
  suggestion,
  authorId,
  channelId
) => {
  return new Promise((resolve, reject) => {
    // add a new suggestion to the database only if message_id is not already in the database
    pool.query(
      `INSERT INTO suggestions (server_id, message_id, channel_id, content, user_id, upvotes, downvotes, upvoters,
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
       WHERE NOT EXISTS(SELECT message_id
                        FROM suggestions
                        WHERE message_id = tmp.message_id)
       LIMIT 1;`,
      [
        guildId,
        suggestionId,
        channelId,
        suggestion,
        authorId,
        0,
        0,
        '[]',
        '[]',
        '[]',
        getCurrentDate(),
      ],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const addSuggestionUpvote = async (guildId, suggestionId, userId) => {
  // add a new upvote to the suggestion only if the user has not already upvoted it
  // console.log(guildId)
  // console.log(suggestionId)
  // console.log(userId)
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
          reject(err)
        } else {
          // console.log(results);
          // console.log(userId);
          // console.log(guildId);
          // console.log(suggestionId);
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
         AND message_id = ?;`,
      [userId, userId, userId, guildId, suggestionId, userId, userId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
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
         AND message_id = ?;`,
      [userId, userId, userId, guildId, suggestionId, userId, userId],
      (err, results) => {
        // console.log(err);
        // console.log(results);
        if (err) {
          reject(err)
        } else {
          if (
            results.affectedRows === 0 ||
            results.affectedRows === undefined
          ) {
            resolve(false)
          } else {
            resolve(true)
          }
        }
      }
    )
  })
}

const addServerSuggestionChannel = async (guildId, channelId) => {
  return new Promise((resolve, reject) => {
    let channelIdArray = []
    channelIdArray.push(channelId)
    let channelIDObject = {
      channel_id_array: channelIdArray,
    }
    // get the current suggestion channel array from the channels table, and add it to the array
    pool.query(
      `SELECT channel_id_array
       FROM channels
       WHERE server_id = ?;`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          if (results.length === 0) {
            pool.query(
              `INSERT INTO channels (server_id, channel_id_array)
               VALUES (?, ?);`,
              [guildId, JSON.stringify(channelIDObject)],
              (err, results) => {
                if (err) {
                  reject(err)
                } else {
                  resolve(true)
                }
              }
            )
          } else {
            let suggestionChannels = JSON.parse(results[0]?.channel_id_array)
            if (
              suggestionChannels?.channel_id_array?.includes(
                channelId.toString()
              )
            ) {
              resolve(false)
            } else {
              suggestionChannels?.channel_id_array.push(channelId)
              if (!suggestionChannels) {
                suggestionChannels = channelIDObject
              }
              pool.query(
                `UPDATE channels
                 SET channel_id_array = ?
                 WHERE server_id = ?;`,
                [JSON.stringify(suggestionChannels), guildId],
                (err, results) => {
                  if (err) {
                    reject(err)
                  } else {
                    resolve(true)
                  }
                }
              )
            }
          }
        }
      }
    )
  })
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
          reject(err)
        } else {
          if (results.length === 0) {
            resolve(false)
          } else {
            const { downvoted, upvoted } = results[0]
            if (upvoted === 1) {
              resolve('up')
            } else if (downvoted === 1) {
              resolve('down')
            } else {
              resolve(false)
            }
          }
        }
      }
    )
  })
}

const cacheSetSortedGuilds = async (guilds) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE
       FROM cache
       WHERE sorted_guilds IS NOT NULL`,
      (err, results) => {
        if (err) {
          reject(err)
        }
      }
    )

    pool.query(
      `INSERT INTO cache (sorted_guilds)
       VALUES (?)`,
      [JSON.stringify(guilds)],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      }
    )
  })
}

const cacheGetSortedGuilds = async () => {
  return new Promise((resolve, reject) => {
    pool.query(
      `SELECT sorted_guilds
       FROM cache;`,
      [],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(JSON.parse(results[0].sorted_guilds))
        }
      }
    )
  })
}

const deleteServer = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE
       FROM servers
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      }
    )
  })
}

const deleteSuggestions = async (guildId) => {
  return new Promise((resolve, reject) => {
    pool.query(
      `DELETE
       FROM suggestions
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          reject(err)
        } else {
          resolve(true)
        }
      }
    )
  })
}

const deleteSuggestMessageIDs = async (guildId) => {
  return new Promise(async (resolve, reject) => {
    // get all IDs from channels table
    let channels = await getServerSuggestionChannels(guildId)
    for (let i = 0; i < channels.length; i++) {
      let channel = channels[i]
      pool.query(
        `DELETE
         FROM suggest_message_ids
         WHERE channel_id = ?`,
        [channel],
        (err, results) => {
          if (err) {
            console.log(err)
            resolve(false)
          }
        }
      )
    }
    pool.query(
      `DELETE
       FROM channels
       WHERE server_id = ?`,
      [guildId],
      (err, results) => {
        if (err) {
          console.log(err)
          resolve(false)
        } else {
          resolve(true)
        }
      }
    )
    resolve(true)
  })
}

module.exports = {
  pool,
  getCurrentDate,
  getServerLanguage,
  getAllServerSettings,
  getAllUserSuggestions,
  getServerSuggestionChannel,
  getServerSuggestionChannels,
  getServerEmbedData,
  getSuggestionVoters,
  getServerAllowsLinks,
  getAcceptUpvotes,
  getDeclineDownvotes,
  getNumberOfSuggestions,
  getNumberOfSuggestionsInGuild,
  getGuildsWithMostSuggestions,
  getServerAutoThread,
  getSuggestionThread,
  getServerSuggestionsSortedByUpvotes,
  getSuggestMessage,
  getServerMaxChannels,

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
  setServerAutoAccept,
  setServerAutoDecline,
  setServerAutoThread,
  setSuggestionThread,
  setSuggestMessage,
  setDeleteSuggestion,
  setServerSuggestionChannels,
  setServerMaxChannels,

  addNewSuggestion,
  addSuggestionUpvote,
  addSuggestionDownvote,
  addSuggestionUpvoteRevoteDown,
  addSuggestionDownvoteRevoteUp,
  addServerSuggestionChannel,

  checkForUserVote,

  cacheSetSortedGuilds,
  cacheGetSortedGuilds,

  deleteServer,
  deleteSuggestions,
  deleteSuggestMessageIDs,
}
