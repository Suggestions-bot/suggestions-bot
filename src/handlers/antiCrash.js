const Logger = require("./logger");

module.exports = client => {
   process.on('unhandledRejection', (reason, p) => {
        Logger.warn(`Unhandled Rejection/Catch`, `${reason}\n${p}`);
    });
    process.on("uncaughtException", (err, origin) => {
        Logger.error(`Uncaught Exception/Catch`, `${err}\n${origin}`);
    }) 
    process.on('uncaughtExceptionMonitor', (err, origin) => {
        Logger.error(`Uncaught Exception/Catch (MONITOR)`, `${err}\n${origin}`);
    });
    process.on('multipleResolves', (type, promise, reason) => {
        Logger.warn(`Multiple Resolves`, `${type}\n${promise}\n${reason}`);
    });
}
