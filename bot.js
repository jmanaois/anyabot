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
const{ prefix, token } = require('./auth.json');


//===== startup bot =====//

console.log('bot on');

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
const reactFiles = fs.readdirSync('./react_commands').filter(file => file.endsWith('.js'));


for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

for (const file of reactFiles) {
	const command = require(`./react_commands/${file}`);
	client.reactCommands.set(command.emoji, command); 
}

//===== bot commands =====//

client.once('ready', () => {
	console.log('bot setup successful');
	asmt_queue.sync({force: true});
	users.sync({force: true});
}); 


client.on('messageReactionAdd', async (reaction, user) => {

	if(reaction.partial){
		try{
			await reaction.fetch();
		}catch(error){
			console.error('an error occurred while fetching: ', error);
			return;
		}
	}

	if(reaction.message.author.id === client.user.id){ 


		if(!client.reactCommands.has(reaction.emoji.name)){ console.log('reaction command not found'); return; }

		try{
			client.reactCommands.get(reaction.emoji.name).execute(reaction, user, client);
		}catch(error){
			console(error);
			message.channel.send('an unknown error occurred');
		}
		
	}

});


client.on('message', message => {
	if(!message.content.startsWith(prefix) || message.author.bot){ return; }

	const args = message.content.slice(prefix.length).trim().split(/ +/);
	const command = args.shift().toLowerCase();

	if(!client.commands.has(command)){ console.log('command not found'); return; }

	try{
		client.commands.get(command).execute(message, args, client);
	}catch(error){
		console.error(error);
		message.channel.send('an unknown error occurred.');
	}
}); 

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
    `Volume: \`${queue.volume}%\` | Filter: \`${queue.filters.names.join(', ') || 'Off'}\` | Loop: \`${
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