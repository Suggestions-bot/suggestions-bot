const db = require("quick.db");
const Logger = require('../../logger');

module.exports = {

    addKey(table, key) {
        try {
            let data = db.fetch(table)
            if (data == null) db.set(table, [key])
            else db.push(table, key)
            return true
        }
        catch (err) {
            Logger.error(`Error adding key to table ${table}`, err)
            return null
        }
        
    },

    removeKey(table, key) {
        try {
            let data = db.fetch(table)
            if (data == null) return
            else db.remove(table, key)
            return true	
        }
        catch (err) {
            Logger.error(`Error removing key from table ${table}`, err)
            return null
        }
    },

    checkKey(table, key) {
        try {
            let data = db.fetch(table)
            if (data == null) return false
            else if (data.includes(key)) return true
            else return false
        }
        catch (err) {
            Logger.error(`Error checking key in table ${table}`, err)
            return null
        }
    },

    getKeys(table) {
        try {
            let data = db.fetch(table)
            if (data == null) return false
            else return data
        }
        catch (err) {
            Logger.error(`Error getting keys from table ${table}`, err)
            return null
        }
    },

    getAll(table) {
        try {
            let data = db.fetch(table)
            if (data == null) return null
            else return data.map(key => ({ key: key, value: db.fetch(key) }))
        }
        catch (err) {
            Logger.error(`Error getting all from table ${table}`, err)
            return null
        }
    },

    getValues(table) {
        try {
            let data = db.fetch(table)
            if (data == null) return null
            else return data.map(key => db.fetch(key))
        }
        catch (err) {
            Logger.error(`Error getting values from table ${table}`, err)
            return null
        }
    }

};

