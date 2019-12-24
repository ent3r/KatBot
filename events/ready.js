/**
 * ! Ready event file
 * 
 * ? This is activated whenever the bot started & is ready to serve.
 */
let fs = require('fs');

module.exports.run = (client, serverInfo, config) => {
    console.log("Bot logged in and ready.");

    fs.readdir('./cmds', (err, files) => {
        files.forEach(file => {
            let info = require(`../cmds/${file}`);
            if (!info.title || !info.details) return;
            config.commands.set(info.details.cmd, {
                title      : info.title,
                perms      : info.details.perms,
                command    : info.details.command,
                description: info.details.description
            })
        });
    });
}