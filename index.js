/**
 * Module dependencies.
 */
require('dotenv').config();
const {
  Client,
  Collection
} = require("discord.js");
const Discord = require("discord.js");
const client = new Client();
const serverInfo = require("./serverInfo.js");
let config = {
  commands: new Collection(),
}

client.on("ready", () => {
  ipc.server.start();
  require('./events/ready').run(client, serverInfo, config);
});

client.on("guildMemberAdd", member => {
  memberLog(member.user, true);
});

client.on("guildMemberRemove", member => {
  memberLog(member.user, false);
});

client.on("message", async message => {
  if (message.guild.id == serverInfo.guildId) log(`\`${message.content}\` was sent in <#${message.channel.id}>`)
  messageProcess(message);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if (newMessage.guild.id == serverInfo.guildId) log(`\`${oldMessage.content}\` -> \`${newMessage.content}\``)
  messageProcess(newMessage);
});

/**
 * 
 * @param user User to report on
 * @param didJoin If the user joined or not
 */
function memberLog(user, didJoin) {
  let out = didJoin ? `✅ \`[${new Date().toTimeString().split(" ")[0]}]\` **${user.tag}** joined the guild. Total members: ${client.guilds.get(serverInfo.guildId).memberCount}` :
    `❌ \`[${new Date().toTimeString().split(" ")[0]}]\` **${user.tag}** left the guild. Total members: ${client.guilds.get(serverInfo.guildId).memberCount}`;
  log(out);
}

/**
 * 
 * @param content What to log
 */
function log(content) {
  client.guilds.get(serverInfo.logserverId).channels.get(serverInfo.channels.log).send(content);
}

/**
 * 
 * @param message Message to log
 */
async function messageProcess(message) {
  if (message.author.bot) {
    /**
     * ! Self/Bot responses
     */
  } else {
    var args = message.content.split(/ +/);
    let data = {
      client: client,
      serverInfo: serverInfo,
      message: message,
      args: args,
      config: config,
      sendEmbed: sendEmbed,
      log: log,
    }
    if (message.channel.type === "text") {
      if (message.guild.id == serverInfo.guildId) {
        client.guilds.get(serverInfo.guildId).fetchMember(message.author).then(m => {
          message.member = m;
          if (message.member.roles.has(serverInfo.roles.admin) || message.author.id == serverInfo.devId) message.member.isAdmin = true;
          let cmd = message.content.startsWith(serverInfo.prefix) ? args[0].substring(serverInfo.prefix.length).toLowerCase() : undefined;

          /**
           * ! This means the commands are automatically added as the files are added
           * ? I used to have a help command here but I got rid of it when redoing the commands
           * ? and I haven't found the need for a help command yet, might add later?
           */
          if (config.commands.has(cmd)) {
            require(`./cmds/${cmd}`).run(data);
          }
        }).catch(e => {});
      } else if (message.guild.id == serverInfo.logserverId) {
        /**
         * ! This was mostly just added as a quick way to check if things work properly
         */
        if (message.channel.id == serverInfo.channels.run) {
          try {
            require(`./cmds/run`).run(data, true);
          } catch (error) {
            console.log(error);
          }
        }
      }
    }
  }
}

/**
 * Obvious
 * @param channel 
 * @param message 
 * @param desc 
 * @param time 
 */
let sendEmbed = (channel, message, desc, time) => {
  const embed = new Discord.RichEmbed()
    .setColor([26, 140, 255])
    .setAuthor(message, client.user.displayAvatarURL);
  if (desc) embed.setDescription(desc)
  channel.send(embed)
    .then(m => {
      if (time)
        m.delete(time)
    })
    .catch(e => {});
}

client.login(process.env.BOT_TOKEN);