/**
 * ! Help command
 * 
 * ? Well... Show the information of the commands? Hehe
 */
const Discord = require('discord.js');

module.exports = {
  title: "Help",
  details: {
    perms: "Everyone",
    command: "!help",
    cmd: "help",
    description: `Discplays commands`
  },

  run: ({
    client,
    serverInfo,
    message,
    args,
    pool,
    sendEmbed,
    config,
    member
  }, isDM) => {
    if (args.length === 1) {
      let a = config.commands;
      let help = {
        everyone: [],
        moderator: [],
        admin: [],
        developer: []
      }

      a.forEach(cmd => {
        help[cmd.perms.toLowerCase()].push(cmd.title);
      })

      if (isDM) {
        const emb = new Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setAuthor("Help command", client.user.displayAvatarURL)
          .setFooter('Execute "!help <Command>" for details');
        if (help.everyone.length !== 0) emb.addField("Everyone commands", help.everyone.join("\n"))
        if (member.isModerator && help.moderator.length !== 0) emb.addField("Moderator commands", help.moderator.join("\n"))
        if (member.isAdmin && help.admin.length !== 0) emb.addField("Admin commands", help.admin.join("\n"))
        if (member.isDeveloper && help.developer.length !== 0) emb.addField("Developer commands", help.developer.join("\n"))
        message.channel.send(emb);
      } else if (message.channel.id === serverInfo.channels.botTest || message.author.id == serverInfo.devId) {
        const emb = new Discord.RichEmbed()
          .setColor([255, 0, 0])
          .setAuthor("Help command", client.user.displayAvatarURL)
          .setFooter('Private message "!help <Command>" for details');
        if (help.everyone.length !== 0) emb.addField("Everyone commands", help.everyone.join("\n"))
        message.channel.send(emb);
      }
    } else if (args.length === 2 && isDM) {
      let filtered = config.commands.filter(c => c.title.toLowerCase().includes(args[1].toLowerCase()));
      const emb = new Discord.RichEmbed()
        .setColor([255, 0, 0])
        .setAuthor("Help command: " + args[1], client.user.displayAvatarURL);
      filtered.forEach(cmd => {
        emb.addField(cmd.command, `${cmd.description}\n\`[${cmd.perms}]\``)
      })
      message.channel.send(emb);
    }
  }
}