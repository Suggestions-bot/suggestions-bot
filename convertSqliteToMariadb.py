# script to convert a sqlite database to an sql script for mariadb

# sqlite structure:
# Row names: ID, json
# content example: Suggestions_630393266419925002_235409252364189696, {"sugs":[{"url":"https://discord.com/channels/630393266419925002/1001023447364804648/1005170056273080443","content":"/manage add"},{"url":"https://discord.com/channels/630393266419925002/1001023447364804648/1005170220987584642","content":"Hello World"},{"url":"https://discord.com/channels/630393266419925002/1001023447364804648/1005171261548265472","content":"hab other suggestion"}]}

# mariadb structure:
# 2 tables: servers and suggestions
# servers: id, server_id, manager_role, upvote_emoji, downvote_emoji, suggestion_channel, suggestion_embed_color, accepted_emoji, denied_emoji, language, allow_links
# the important ones are server_id, suggestion_channel, suggestion_embed_color, language
# suggestions: id, message_id, user_id, server_id, upvotes, upvoters, downvotes, downvoters, content, re_voters, creation_date, accepted
# the important ones are message_id, user_id, content, creation_date, accepted, downvoters, upvoters

import sqlite3
import json
import mariadb

# open sqlite database
conn = sqlite3.connect('json.sqlite')
c = conn.cursor()

sqlc = mariadb.connect(
    host="localhost",
    user="root",
    password="root",
    database="suggestions_bot"
)
print(sqlc)
sqlcursor = sqlc.cursor()


def getServerLanguage():
    # get all rows in which the ID row starts with "Language_"
    c.execute("SELECT * FROM suggestion_def WHERE ID LIKE 'Language_%'")
    rows = c.fetchall()
    # create a dictionary with the server id as key and the settings as value
    serverSettings = {}
    for row in rows:
        # get the server id from the ID row
        serverId = row[0].split("_")[1]
        # get the settings from the json row
        settings = json.loads(row[1])
        # convert settings from string to a dictionary
        if type(settings) == str:
            settings = json.loads(settings)
        # add the settings to the dictionary
        serverSettings[serverId] = settings

    return serverSettings


def getServerEmbed():
    # get all rows in which the ID row starts with "CustomEmbed_"
    c.execute("SELECT * FROM suggestion_def WHERE ID LIKE 'CustomEmbed_%'")
    rows = c.fetchall()
    # create a dictionary with the server id as key and the settings as value
    serverSettings = {}
    for row in rows:
        # get the server id from the ID row
        serverId = row[0].split("_")[1]
        # get the settings from the json row
        settings = json.loads(row[1])
        # convert settings from string to a dictionary
        if type(settings) == str:
            settings = json.loads(settings)
        # add the settings to the dictionary
        serverSettings[serverId] = settings

    return serverSettings


def getServerSuggestionsChannel():
    # get all rows in which the ID row starts with "SuggestionsChannel_"
    c.execute("SELECT * FROM suggestion_def WHERE ID LIKE 'SuggestionsChannel_%'")
    rows = c.fetchall()
    # create a dictionary with the server id as key and the settings as value
    serverSettings = {}
    for row in rows:
        # get the server id from the ID row
        serverId = row[0].split("_")[1]
        # get the settings from the json row
        settings = json.loads(row[1])
        # convert settings from string to a dictionary
        if type(settings) == str:
            settings = json.loads(settings)
        # add the settings to the dictionary
        serverSettings[serverId] = settings

    return serverSettings


def getServerSettings():
    # get the data from the 3 above functions
    serverLanguage = getServerLanguage()
    serverEmbed = getServerEmbed()
    serverSuggestionsChannel = getServerSuggestionsChannel()
    # merge the data into one dictionary
    serverSettings = {}
    for serverId in serverLanguage:
        serverSettings[serverId] = {}
        try:
            serverSettings[serverId]["language"] = serverLanguage[serverId]
        except KeyError:
            pass
        try:
            serverSettings[serverId]["embed"] = serverEmbed[serverId]
        except KeyError:
            pass
        try:
            serverSettings[serverId]["suggestions_channel"] = serverSuggestionsChannel[serverId]["channel"]
        except KeyError:
            pass
    return serverSettings


def getServerSuggestions():
    # get all rows in which the ID row starts with "Suggestions_"
    c.execute("SELECT * FROM suggestion_def WHERE ID LIKE 'Suggestions_%'")
    rows = c.fetchall()
    # create a dictionary with the server id as key and the suggestions as value
    serverSuggestions = {}
    # check if row[0] actually starts with "Suggestions_"
    for row in rows:
        # print(row[0])
        if not row[0].startswith("Suggestions_"):
            # print(row)
            rows.remove(row)
        elif row[0].startswith("SuggestionsChannel_"):
            # print(row)
            rows.remove(row)
        # else:
        # print(row[0])
    # print(rows)
    # for row in rows:
    # print(row[0])

    for row in rows:
        # print(row)
        # get the server id from the ID row
        serverId = row[0].split("_")[1]
        # get the message id from the ID row
        try:
            messageId = row[0].split("_")[2]
            try:
                user_id = row[0].split("_")[3]
            except IndexError:
                user_id = ""
                print("no user id")
            # get the suggestions from the json row
            suggestions = json.loads(row[1])
            suggestions["user_id"] = user_id
            # add the suggestions to the dictionary
            # add messageid to the suggestions as a key
            # suggestions["message_id"] = messageId
            # add the suggestions to the dictionary with the server id as key if it doesn't exist yet and add it to the list if it does
            if serverId not in serverSuggestions:
                serverSuggestions[serverId] = [suggestions]
            else:
                serverSuggestions[serverId].append(suggestions)
        except:
            pass
            # print("\n\n\n\n\n\n\n\n\n\n\n\n" + str(row) + "\n\n\n\n\n\n\n\n\n\n\n\n")
    print(serverSuggestions)
    cleanServerSuggestions = {}
    for server in serverSuggestions:
        # print(server)
        for sug in serverSuggestions[server]:
            # print(sug)
            for suggestion in sug["sugs"]:
                # print(suggestion)
                if suggestion["content"] == "":
                    # print(suggestion)
                    # serverSuggestions[server].remove(suggestion)
                    pass
                elif suggestion["content"].lower() == "test":
                    # print(suggestion)
                    # serverSuggestions[server][sug]["sugs"].remove(suggestion)
                    pass
                else:
                    # print(suggestion)
                    # get the url of the suggestion
                    url = suggestion["url"]
                    # print(url)
                    url = url.split("/")[6]
                    # print(url)
                    # add the url to the suggestion
                    suggestion["message_id"] = url
                    # remove the url from the suggestion
                    del suggestion["url"]
                    if server not in cleanServerSuggestions:
                        cleanServerSuggestions[server] = [suggestion]
                    else:
                        cleanServerSuggestions[server].append(suggestion)

    return cleanServerSuggestions


def getServerSuggestionsWithVotes():
    serverSuggestions = getServerSuggestions()
    sugsWithVotes = {}
    for server in serverSuggestions:
        for suggestion in serverSuggestions[server]:
            # get the row from the database
            c.execute("SELECT * FROM suggestion_def WHERE ID = ?", (suggestion["message_id"],))
            row = c.fetchone()
            # get the votes from the json row
            votes = json.loads(row[1])
            if type(votes) == str:
                votes = json.loads(votes)
                # check if votes contains the key upVoters
            if not "upVoters" in votes:
                pass
            else:
                # delete votersInfo from votes
                del votes["votersInfo"]
                # add votes to suggestion
                suggestion["votes"] = votes
                # add suggestion to sugsWithVotes
                if server not in sugsWithVotes:
                    sugsWithVotes[server] = [suggestion]
                else:
                    sugsWithVotes[server].append(suggestion)

    return sugsWithVotes


def assembleSQL():
    serverSuggestions = getServerSuggestionsWithVotes()
    serverSettings = getServerSettings()
    # print(serverSettings)

    finalJson = {}
    for server in serverSuggestions:
        finalJson[server] = {}
        try:
            finalJson[server]["suggestions"] = serverSuggestions[server]
        except KeyError:
            pass
        try:
            finalJson[server]["settings"] = serverSettings[server]
        except KeyError:
            pass
    # print(finalJson)

    return finalJson


def writeServerSettings(finalJson):
    for server in finalJson:
        #print(server)
        # add the server to the database
        eh = sqlcursor.execute("INSERT INTO servers (server_id) VALUES (%s)", (server,))

        # add the settings to the database
        try:
            for setting in finalJson[server]["settings"]:
                #print(setting)
                setting2 = setting
                if setting == "language":
                    setting2 = "language"
                    sqlcursor.execute("UPDATE servers SET " + setting2 + " = %s WHERE server_id = %s",
                                      (finalJson[server]["settings"][setting], server))
                elif setting == "suggestions_channel":
                    setting2 = "suggestion_channel"
                    sqlcursor.execute("UPDATE servers SET " + setting2 + " = %s WHERE server_id = %s",
                                      (finalJson[server]["settings"][setting], server))
                elif setting == "embed":
                    for embed_setting in finalJson[server]["settings"][setting]:
                        #print(embed_setting)
                        embed_setting2 = embed_setting
                        if embed_setting == "color":
                            embed_setting2 = "suggestion_embed_color"
                            #print(finalJson[server]["settings"][setting][embed_setting])
                        elif embed_setting == "dicon":
                            embed_setting2 = "downvote_emoji"
                            #print(finalJson[server]["settings"][setting][embed_setting])
                            sqlcursor.execute("UPDATE servers SET " + embed_setting2 + " = %s WHERE server_id = %s",
                                              (finalJson[server]["settings"][setting][embed_setting], server))
                            embed_setting2 = "denied_emoji"
                            #print(finalJson[server]["settings"][setting][embed_setting])
                        elif embed_setting == "uicon":
                            embed_setting2 = "upvote_emoji"
                            #print(finalJson[server]["settings"][setting][embed_setting])
                            sqlcursor.execute("UPDATE servers SET " + embed_setting2 + " = %s WHERE server_id = %s",
                                              (finalJson[server]["settings"][setting][embed_setting], server))
                            embed_setting2 = "accepted_emoji"
                            #print(finalJson[server]["settings"][setting][embed_setting])

                        sqlcursor.execute("UPDATE servers SET " + embed_setting2 + " = %s WHERE server_id = %s",
                                          (finalJson[server]["settings"][setting][embed_setting], server))
        except KeyError:
            pass

def writeServerSuggestions(finalJson):
    for server in finalJson:
        try:
            for suggestion in finalJson[server]["suggestions"]:
                print(suggestion)
                suggestion_author = "100000000000000001" #suggestion["author"]
                suggestion_content = suggestion["content"]
                suggestion_message_id = suggestion["message_id"]
                suggestion_voters = suggestion["votes"]["voters"]
                suggestion_upvoters = suggestion["votes"]["upVoters"]
                suggestion_downvoters = suggestion["votes"]["downVoters"]
                suggestion_revoters = suggestion["votes"]["reVoters"]
                suggestion_upvotes = len(suggestion_upvoters)
                suggestion_downvotes = len(suggestion_downvoters)
                # convert lists to json
                suggestion_upvoters = json.dumps(suggestion_upvoters)
                suggestion_downvoters = json.dumps(suggestion_downvoters)
                suggestion_revoters = json.dumps(suggestion_revoters)


                # add the suggestion to the database
                sqlcursor.execute("INSERT INTO suggestions (message_id, user_id, server_id, upvotes, upvoters, downvotes, downvoters, content, re_voters) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)",
                                  (suggestion_message_id, suggestion_author, server, suggestion_upvotes, suggestion_upvoters, suggestion_downvotes, suggestion_downvoters, suggestion_content, suggestion_revoters))

        except KeyError:
            pass




def writeToMariadb():
    finalJson = assembleSQL()
    # store finalJson in a json file
    # format the json with 4 spaces indents
    with open("suggestions.json", "w") as f:
        json.dump(finalJson, f, indent=4)

    writeServerSettings(finalJson)
    writeServerSuggestions(finalJson)

    # add the setting to the database in the servers table with the server id as key

    eh = sqlc.commit()
    print(eh)


writeToMariadb()
