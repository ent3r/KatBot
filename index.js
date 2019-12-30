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
const mysql = require('mysql');
const serverInfo = require("./serverInfo.js");
var pool = mysql.createPool({
  host: 'localhost',
  user: process.env.DB_LOGIN,
  password: process.env.DB_PASS,
  database: 'bots'
})
let config = {
  commands: new Collection(),
}

client.on("ready", () => {
  require('./events/ready').run(client, serverInfo, config, pool);
});

client.on("guildMemberAdd", member => {
  memberLog(member.user, true);
});

client.on("guildMemberRemove", member => {
  memberLog(member.user, false);
});

client.on("message", async message => {
  if(!message.author.bot){
    if (message.channel.type == 'dm') log(`\`${message.cleanContent}\` was sent from <@${message.author.id}> (${message.author.id})`)
    else if (message.guild.id == serverInfo.guildId && message.channel.id != serverInfo.channels.log && message.author.id !== serverInfo.devId) log(`\`${message.cleanContent}\` was sent from <@${message.author.id}> (${message.author.id}) in ${message.channel.name} (<#${message.channel.id}>)`)
  }
  messageProcess(message);
});

client.on("messageUpdate", async (oldMessage, newMessage) => {
  if(oldMessage.author.bot) return;
  if (newMessage.guild.id == serverInfo.guildId && oldMessage.channel.id != serverInfo.channels.log) log(`\`${oldMessage.cleanContent}\` -> \`${newMessage.cleanContent}\` at ${newMessage.url}`)
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
  client.channels.get(serverInfo.channels.log).send(content);
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
    var args = message.cleanContent.split(/ +/);
    let data = {
      client: client,
      serverInfo: serverInfo,
      message: message,
      args: args,
      config: config,
      sendEmbed: sendEmbed,
      log: log,
      pool: pool,
    }
    if (message.channel.type === "text") {
      if (message.guild.id !== serverInfo.guildId) return;
      if (message.channel.id == serverInfo.channels.run) {
        try {
          require(`./cmds/run`).run(data, false, true);
        } catch (error) {
          console.log(error);
        }
      } else if (message.channel.id == serverInfo.channels.log) {
        /**
         * ! ignore dat shit
         */
      } else {
        client.guilds.get(serverInfo.guildId).fetchMember(message.author).then(m => {
          if (message.author.id == serverInfo.devId)
            m.isDeveloper = true;
          else
            m.isDeveloper = false;

          if (m.roles.has(serverInfo.roles.admin) || m.isDeveloper)
            m.isAdmin = true;
          else
            m.isAdmin = false;

          if (m.roles.has(serverInfo.roles.moderator) || m.isAdmin)
            m.isModerator = true;
          else
            m.isModerator = false;

          if (m.roles.has(serverInfo.roles.smallmod) || m.isModerator)
            m.isSmallMod = true;
          else
            m.isSmallMod = false;

          message.member = m;
          
          let cmd = message.content.startsWith(serverInfo.prefix) ? args[0].substring(serverInfo.prefix.length).toLowerCase() : undefined;

          /**
           * ! This means the commands are automatically added as the files are added
           */
          if (config.commands.has(cmd)) {
            require(`./cmds/${cmd}`).run(data);
          }
        }).catch(e => {});
      }
    } else {
      client.guilds.get(serverInfo.guildId).fetchMember(message.author).then(m => {
        if (message.author.id == serverInfo.devId)
          m.isDeveloper = true;
        else
          m.isDeveloper = false;

        if (m.roles.has(serverInfo.roles.admin) || m.isDeveloper)
          m.isAdmin = true;
        else
          m.isAdmin = false;

        if (m.roles.has(serverInfo.roles.moderator) || m.isAdmin)
          m.isModerator = true;
        else
          m.isModerator = false;

        if (m.roles.has(serverInfo.roles.smallmod) || m.isModerator)
          m.isSmallMod = true;
        else
          m.isSmallMod = false;

        data.member = m;
        let cmd = args[0].toLowerCase();
        if (config.commands.has(cmd)) {
          require(`./cmds/${cmd}`).run(data, true);
        }
      })
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