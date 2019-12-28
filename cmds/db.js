var Discord = require('discord.js')
module.exports = {
    title: "Database",
    details: {
        perms: "Admin",
        command: "!db",
        cmd: "db",
        description: `Tries database connection`
    },

    run: ({
        serverInfo,
        message,
        client,
        args,
        pool,
    }) => {
        if (!message.member.isAdmin) return;
        let content = args.slice(1).join(' ');
        try {
            pool.query(content+' limit 10', (err, res, fields) => {
                if (err) console.log(err);
                if(Array.isArray(res)){
                    const embed = new Discord.RichEmbed().setColor([26,140,255]).setDescription('Database response');
                    if(res.length == 1){
                        let obj = res[0];
                        Object.keys(obj).forEach(key => {
                            if(obj[key] != null) embed.addField(`${prettify(key)} (${key})`, prettifyDesc(obj, key));
                        })
                    } else {
                        res.forEach((row, index) => {
                            embed.addField(`Response row ${index}`, prettifyObj(row))
                        })
                    }
                    message.channel.send(embed);
                }
            })
        } catch (e) {
            console.error(e);
        }
    }
}

let calcTime = time => {
    let out = ""
    time /= 1000
    let timings = {
        days    : Math.floor(time/86400)
    }
    timings.hours = Math.floor((time - timings.days*24)/3600);
    timings.minutes = Math.floor((time - timings.hours*60)/60);
    timings.seconds = Math.floor((time - timings.minutes*60))
    let first = true;
    Object.keys(timings).forEach(k => {
        if(timings[k] >= 1) out += `${(first?'':', ') + timings[k]} ${timings[k]==1?k.substring(0,k.length-1):k}`
    })
    return out;
}

let prettifyObj = obj => {
    let out = "";
    let first = true;
    Object.keys(obj).forEach(k => {
        if (obj[k] != null) {
            out += `${first?``:` | `}${prettify(k)} = ${prettifyDesc(obj, k)}`
            if (first) first = false;
        }
    })
    return out
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