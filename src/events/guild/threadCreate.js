const Logger = require("../../handlers/logger");
module.exports = async (client, thread) => {
    if(thread.joinable){
        try{
            await thread.join();
        }catch (e){
            Logger.error(`Error joining thread ${thread.name}`, e);
        }
    }
}
