/**
 * ! Ready event file
 * 
 * ? This is activated whenever the bot started & is ready to serve.
 */
let fs = require('fs');

module.exports.run = (client, serverInfo, config, pool) => {
    console.log("KatBot logged in and ready.");

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
            pool.query(`SELECT offender_id, type, p_id FROM logs WHERE timestamp + duration < ${currTime} AND finished IS NULL`, (err, res, fields) => {
                if (err) console.log(err);
                if(Array.isArray(res)){
                    if(res.length >= 1){
                        res.forEach(row => {
                            let type = "";
                            switch(row.type){
                                case 'mute': type="muted"; break;
                            }
                            console.log("trying to unmute")
                            client.guilds.get(serverInfo.guildId).members.get(row.offender_id).removeRole(serverInfo.roles[type]);
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
