const Discord = require('discord.js')

module.exports = {
	name: 'help',
	aliases: ['h', 'cmd', 'command'],
	description: 'displays the set of commands and their usage',
	usage: '!help [command]',
    run: async (client, message) => {
        message.channel.send({
          embeds: [
            new Discord.MessageEmbed()
              .setTitle('Commands')
              .setDescription(client.commands.map(cmd => `\`${cmd.name}\``).join(', '))
              .setColor('BLURPLE')
          ]
        })
      }
    }
