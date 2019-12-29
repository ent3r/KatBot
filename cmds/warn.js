const Discord = require("discord.js");
module.exports = {
    title: "Warn",
    details: {
        perms: "Admin",
        command: "!warn @user/id reason",
        cmd: "warn",
        description: `Warns someone`
    },

    run: ({
        serverInfo,
        message,
        client,
        args,
        pool,
        sendEmbed,
    }, isDM) => {
        if(isDM) return;
        if (!message.member.isAdmin) return;
        let req = args.slice(1);
        if(req.length == 0){
            message.channel.send(`No tag/ID provided!\nUsage: \`!warn @user/id reason\``);
            return;
        } 
        else if (req.length == 1) {
            message.channel.send(`No reason provided!\nUsage: \`!warn @user/id reason\``);
            return;
        }
        let user = message.mentions.users.first() ? message.mentions.users.first().id : req[0];
        message.guild.fetchMember(user).then(async m => {
            req = req.slice(1);
            let reason = req.join(' ');
            let timestamp = Date.now();
            let sql = 'INSERT INTO logs(offender_id, mod_id, timestamp, reason, type) VALUES(?, ?, ?, ?, ?)'
            let values = [
                m.id,
                message.member.id,
                timestamp,
                reason,
                'warn'
            ]
            sql = require('mysql').format(sql, values);
            try {
                pool.query(sql, (err, res, fields) => {
                    if (err) console.log(err);
                    pool.query(`SELECT p_id from logs where timestamp = ${timestamp} and offender_id=${m.id}`, (err, res, fields) => {
                        sendEmbed(message.channel, `Warned ${m.displayName}. Case number ${res[0].p_id}. Reason \`${reason}\``)
                    })
                })
            } catch (e) {
                console.error(e);
            }
        }).catch(e => {
            if (e.message == "Unknown User") {
                sendEmbed(message.channel, `Attempted warn of unknown user`, "This user wasn't found in the server.");
            } else
                console.log(e);
        })
    }
}