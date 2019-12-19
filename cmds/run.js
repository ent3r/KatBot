const Discord = require("discord.js");

module.exports = {
    title: "Run",
    details: {
        perms: "Dev",
        command: "!run <code>",
        cmd: "run",
        description: `Runs given code`
    },

    run: ({
        serverInfo,
        message,
        client,
        args
    }, wasTyped) => {
        if (message.member.id != serverInfo.devId) return;

        var out = null;
        try {
          out = eval(wasTyped!=null?message.content:args.slice(1).join(` `));
        } catch (e) {
          out = e.toString();
        }
        if (out!=null) client.guilds.get(serverInfo.logserverId).channels.get(serverInfo.channels.runOut).send(out.toString());
    }
}