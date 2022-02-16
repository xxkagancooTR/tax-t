const Discord = require('discord.js');
const { EasyClient } = require('dis-easystart')
const database = require('quick.db');
const ms = require('ms');
const Settings = require('../ayarlar.js')
const moment = require('moment');
moment.locale('tr');

exports.run = async(client, message, args) => {
if(![(Settings.muteperm)].some(role => message.member.roles.cache.get(role)) && !message.member.hasPermission('ADMINISTRATOR')) return message.reply(`Bu Komut İçin Yetkiniz Bulunmamaktadır.`) 
    if(!args[0]) return message.reply('Lütfen bir kullanıcı belirtin!')
 if(!args[3]) return message.reply('Lütfen bir sebep belirtin!')
    if(!message.mentions.members.first()) return message.reply('Belirttiğiniz kullanıcıyı bulamadım!')
    const member = message.mentions.members.first()
    if(member.roles.highest.position >= message.member.roles.highest.position || member.user.id == message.guild.ownerId) return message.reply('Bu kullanıcının yetkisi senden üstte!')
    if(member.roles.highest.position >= member.guild.me.roles.highest.position) return message.reply('Bu kullanıcının yetkisi benden üstte')

    const request = require("native-request")
    const headers = {
        "accept": "/",
        "authorization": "Bot " + client.token,
        "content-type": "application/json",
      };


    await request.get(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, headers, async function(err, data, status, headers) {
       if(err) throw err 
       if(new Date(JSON.parse(data).communication_disabled_until || Date.now()).getTime() > Date.now()) return message.reply('Bu kullanıcı zaten susturulmuş durumda!')
let reason = 'Bir sebep girilmemiş.';
let sure = args[1]+' '+args[2];
let end = Date.now()+ms(sure.replace('dakika', 'minutes').replace('saat', 'hours').replace('saniye', 'seconds').replace('gün', 'day'));
let argument_one = ['saniye', 'dakika', 'saat', 'gün'];
       if(!args[1] || isNaN(args[1]) || !args[2] || !['saniye', 'dakika', 'saat', 'gün', 'hafta', 'yıl'].includes(args[2])) return message.reply('Lütfen bir süre belirt')
if(args[3]) reason = args.slice(3).join(' ');
       const timeout = require('ms')(args[1]+args[2].replace('saniye', 's').replace('saat', 'h').replace('gün', 'd').replace('hafta', 'w').replace('yıl', 'y').replace('dakika', 'm'));
       if(!timeout) return message.reply('Lütfen geçerli bir süre belirtiniz!')

       const fetch = require('node-fetch');
       await fetch(`https://discord.com/api/v8/guilds/${message.guild.id}/members/${member.user.id}`, {
         "credentials": "include",
         "headers": {
           "accept": "*/*",
           "authorization": "Bot " + client.token,
           "content-type": "application/json",
         },
         "referrerPolicy": "no-referrer-when-downgrade",
         "body": JSON.stringify({
           "communication_disabled_until": new Date(Date.now()+timeout)
         }),
         "method": "PATCH",
         "mode": "cors"
       });
  await database.set(member.user.id, { 
end: end,
start: Date.now(),
moderatorUsername: message.author.username,
moderatorID: message.author.id,
moderatorAvatarURL: message.author.displayAvatarURL({ dynamic: true }),
reason: reason
});

 
let logChannelID = '890613144362307655'; 
let logChannel = await message.guild.channels.cache.get(logChannelID);


const embed = await new Discord.MessageEmbed()
.setAuthor(message.author.username, message.author.avatarURL({dynamic: true}))
.setTitle('MUTE SİSTEMİ')
.setColor('BLACK')
.setDescription(`**• Ceza veren**: ${message.author}
**• Ceza alan**: <@!${member.user.id}>
**• Sebep**: ${reason}
**• Ceza süresi**: ${sure}
**• Bitiş zamanı:**: ${moment(end+ms('3h')).format('DD.MM.YYYY - HH:mm:ss')}`);
message.channel.send(`Başarılı, ***${member.user.tag}*** susturuldu. Cezasını çeksin hadi bakim.`);

logChannel.send(embed);
setTimeout(() => {
return  (() =>  database.delete(member.user.id) && logChannel.send(embed.setColor('GREEN').setTitle('MUTE SİSTEMİ').setDescription(`**• Ceza veren**: ${message.author}
**• Ceza alan**: <@!${member.user.id}>
**• Sebep**: ${reason}`)));
});




    })

}


module.exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["t", "mute"]
};

module.exports.help = {
  name: 'timeout'
};
