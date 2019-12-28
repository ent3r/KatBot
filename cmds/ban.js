const Discord = require("discord.js");
module.exports = {
    title: "Ban",
    details: {
        perms: "Admin",
        command: "!ban @user/id OPTIONAL: duration(d,h,m,s default:m) reason",
        cmd: "ban",
        description: `Bans someone`
    },

    run: ({
        serverInfo,
        message,
        client,
        args,
        pool,
        sendEmbed,
    }) => {
        if (!message.member.isAdmin) return;
        let req = args.slice(1);
        if (req.length == 0) {
            message.channel.send(`No tag/ID provided!\nUsage: \`!ban @user/id OPTIONAL: duration(d,h,m,s default:m) reason\``)
            return;
        }
        let user = message.mentions.users.first() ? message.mentions.users.first().id : req[0];
        message.guild.fetchMember(user).then(async m => {
            req = req.slice(1);
            let reason = null;
            let timestamp = Date.now();
            let duration = null;
            if (req.length >= 1) {
                let res = req[0].match(/\b[0-9]+[d,h,m,s]?\b/gi);
                if (res.length >= 1) {
                    let mag = res[0].slice(-1);
                    let time = parseInt(req[0].match(/\b[0-9]+/g));
                    time*=1000
                    switch(mag){
                        case 'd': time*=86400; break;
                        case 'h': time*=3600; break;
                        case 's': break;
                        default: time*=60;
                    }
                    duration = time;
                }
                req = req.slice(1);
                if(req.length >= 1){
                    reason = req.join(' ')
                }
            }
            
            let sql = 'INSERT INTO logs(offender_id, mod_id, timestamp, duration, finished, reason, type) VALUES(?, ?, ?, ?, ?, ?, ?)'
            let values = [
                m.id,
                message.member.id,
                timestamp,
                duration,
                duration > 0?false:true,
                reason == null ? 'no reason provided' : reason,
                'ban'
            ]
            sql = require('mysql').format(sql, values);
            try {
                m.ban();
                pool.query(sql, (err, res, fields) => {
                    if (err) console.log(err);
                    pool.query(`SELECT p_id from logs where timestamp = ${timestamp}`, (err, res, fields) => {
                        sendEmbed(message.channel, `Banned ${m.displayName}. Case number ${res[0].p_id}`)
                    })
                })
            } catch (e) {
                console.error(e);
            }
        }).catch(e => {
            if (e.message == "Unknown User") {
                sendEmbed(message.channel, `Attempted ban of unknown user`, "This user wasn't found in the server.");
            } else
                console.log(e);
        })
    }
}