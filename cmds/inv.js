const Discord = require("discord.js");

module.exports = {
    title: "Invite",
    details: {
        perms: "Admin",
        command: "!inv",
        cmd: "inv",
        description: `Generates single use invite`
    },

    run: ({
        serverInfo,
        message,
        client,
        args
    }) => {
        if (!message.member.isAdmin) return;
        

        message.guild.channels.get(serverInfo.channels.rules).createInvite({maxUses:1, maxAge:0}).then(i => message.channel.send(i.url))
    }
}