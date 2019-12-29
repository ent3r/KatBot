const Discord = require("discord.js");
module.exports = {
    title: "Case",
    details: {
        perms: "Admin",
        command: "!Case casenumber",
        cmd: "case",
        description: `Looks up a case`
    },

    run: ({
        serverInfo,
        message,
        client,
        args,
        pool,
    }, isDM) => {
        if(isDM) return;
        if (!message.member.isAdmin) return;
        let req = args.slice(1);
        if (req.length == 1) {
            let sql = 'SELECT * FROM logs WHERE p_id=? limit 10';
            let vals = [parseInt(req[0])]
            sql = require('mysql').format(sql, vals);
            try {
                pool.query(sql, (err, res, fields) => {
                    if (err) console.log(err);
                    if (Array.isArray(res)) {
                        const embed = new Discord.RichEmbed().setColor([26, 140, 255]).setDescription('Database response');
                        if (res.length == 1) {
                            let obj = res[0];
                            Object.keys(obj).forEach(key => {
                                if (obj[key] != null) embed.addField(`${prettify(key)} (${key})`, prettifyDesc(obj, key));
                            })
                        }
                        message.channel.send(embed);
                    }
                })
            } catch (err) {
                console.log(err);
            }
        };
    }
}


let calcTime = time => {
    let out = ""
    time /= 1000
    let timings = {
        days: Math.floor(time / 86400)
    }
    timings.hours = Math.floor((time - timings.days * 24) / 3600);
    timings.minutes = Math.floor((time - timings.hours * 60) / 60);
    timings.seconds = Math.floor((time - timings.minutes * 60))
    let first = true;
    Object.keys(timings).forEach(k => {
        if (timings[k] >= 1) out += `${(first?'':', ') + timings[k]} ${timings[k]==1?k.substring(0,k.length-1):k}`
    })
    return out;
}

let prettify = string => {
    switch (string) {
        case "duration":
            return "Duration";
        case "offender_id":
            return "Offender ID";
        case "mod_id":
            return "Mod ID";
        case "timestamp":
            return "Time";
        case "length":
            return "Length";
        case "p_id":
            return "Case Number";
        case "reason":
            return "Reason";
        case "type":
            return "Type";
        case "finished":
            return "Is Finished"
        default:
            return string;
    }
}

let prettifyDesc = (obj, key) => {
    switch (key) {
        case "timestamp":
            return new Date(obj[key]).toISOString();
        case "duration":
            return calcTime(obj[key]);
        case "finished":
            return obj[key] == 1 ? "Yes" : "No";
        default:
            return obj[key];
    }
}