/**
 * ! Ready event file
 * 
 * ? This is activated whenever the bot started & is ready to serve.
 */
let fs = require('fs');

module.exports.run = (client, serverInfo, config, pool) => {
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

    var checkDBForActions = () => {
        setTimeout(() => {
            let currTime = Date.now();
            pool.query(`SELECT offender_id, type, p_id FROM logs WHERE timestamp + duration < ${currTime} AND finished = ${false} limit 100`, (err, res, fields) => {
                if (err) console.log(err);
                if(Array.isArray(res)){
                    if(res.length >= 1){
                        res.forEach(row => {
                            if(row.type == 'mute'){
                                client.guilds.get(serverInfo.guildId).members.get(row.offender_id).removeRole(serverInfo.roles.muted);
                            } else if (row.type == 'ban'){
                                client.guilds.get(serverInfo.guildId).unban(row.offender_id, 'tempban ended');
                            }
                            pool.query(`UPDATE logs SET finished = true WHERE p_id=${row.p_id}`)
                        })
                    }
                }
            })
            checkDBForActions();
        }, 10000)
    }

    checkDBForActions();
}
