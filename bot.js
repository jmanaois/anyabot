const Discord = require('discord.js');
const fs = require('fs');
const { DisTube } = require('distube')

asmt_queue = require('./sqlitedb');
users = require('./sqlitedb-users');

const client = new Discord.Client({
    intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.GuildVoiceStates,
    Discord.GatewayIntentBits.MessageContent
    ]
});
const config = require('./auth.json')

client.config = require('./auth.json');
client.commands = new Discord.Collection();
client.reactCommands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.emotes = config.emoji;

const { SpotifyPlugin } = require('@distube/spotify')
const { YtDlpPlugin } = require('@distube/yt-dlp')
const{ token } = require('./auth.json');

fs.readdir('./commands/', (err, files) => {
    if (err) return console.log('no commands found')
    const jsFiles = files.filter(f => f.split('.').pop() === 'js')
    if (jsFiles.length <= 0) return console.log('no commands found')
    jsFiles.forEach(file => {
      const cmd = require(`./commands/${file}`)
      console.log(`Loaded ${file}`)
      client.commands.set(cmd.name, cmd)
      if (cmd.aliases) cmd.aliases.forEach(alias => client.aliases.set(alias, cmd.name))
    })
  })

  fs.readdir('./react_commands/', (err, files) => {
    if (err) return console.log('no commands found')
    const jsFiles = files.filter(f => f.split('.').pop() === 'js')
    if (jsFiles.length <= 0) return console.log('no commands found')
    jsFiles.forEach(file => {
      const cmd = require(`./react_commands/${file}`)
      console.log(`Loaded ${file}`)
      client.commands.set(cmd.emoji, cmd)
      if (cmd.aliases) cmd.aliases.forEach(alias => client.aliases.set(alias, cmd.name))
    })
  })
//===== startup bot =====//

console.log('bot on');



//===== bot commands =====//

client.once('ready', () => {
	console.log('bot setup successful');
	asmt_queue.sync({force: true});
	users.sync({force: true});
}); 







// music bot 

client.distube = new DisTube(client, {
  leaveOnStop: false,
  emitNewSongOnly: true,
  emitAddSongWhenCreatingQueue: false,
  emitAddListWhenCreatingQueue: false,
  plugins: [
    new SpotifyPlugin({
      emitEventsAfterFetching: true
    }),
    new YtDlpPlugin()
  ]
})
client.on('messageCreate', async message => {
    if (message.author.bot || !message.guild) return
    const prefix = config.prefix
    if (!message.content.startsWith(prefix)) return
    const args = message.content.slice(prefix.length).trim().split(/ +/g)
    const command = args.shift().toLowerCase()
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command))
    if (!cmd) return
    if (cmd.inVoiceChannel && !message.member.voice.channel) {
      return message.channel.send(`${client.emotes.error} | You must be in a voice channel!`)
    }
    try {
      cmd.run(client, message, args)
    } catch (e) {
      console.error(e)
      message.channel.send(`${client.emotes.error} | Error: \`${e}\``)
    }
  })
  
  const status = queue =>
    `vol: \`${queue.volume}%\` | filt: \`${queue.filters.names.join(', ') || 'off'}\` | loop: \`${
      queue.repeatMode ? (queue.repeatMode === 2 ? 'All Queue' : 'This Song') : 'Off'
    }\` | Autoplay: \`${queue.autoplay ? 'On' : 'Off'}\``
  client.distube
    .on('playSong', (queue, song) =>
      queue.textChannel.send(
        `${client.emotes.play} | Playing \`${song.name}\` - \`${song.formattedDuration}\`\nRequested by: ${
          song.user
        }\n${status(queue)}`
      )
    )
    .on('addSong', (queue, song) =>
      queue.textChannel.send(
        `${client.emotes.success} | Added ${song.name} - \`${song.formattedDuration}\` to the queue by ${song.user}`
      )
    )
    .on('addList', (queue, playlist) =>
      queue.textChannel.send(
        `${client.emotes.success} | Added \`${playlist.name}\` playlist (${
          playlist.songs.length
        } songs) to queue\n${status(queue)}`
      )
    )
    .on('error', (channel, e) => {
      if (channel) channel.send(`${client.emotes.error} | An error encountered: ${e.toString().slice(0, 1974)}`)
      else console.error(e)
    })
    .on('empty', channel => channel.send('Voice channel is empty! Leaving the channel...'))
    .on('searchNoResult', (message, query) =>
      message.channel.send(`${client.emotes.error} | No result found for \`${query}\`!`)
    )
    .on('finish', queue => queue.textChannel.send('Finished!'))
    
client.login(token);