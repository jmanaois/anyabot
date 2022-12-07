const Discord = require('discord.js');
const fs = require('fs');

asmt_queue = require('./sqlitedb');
users = require('./sqlitedb-users');

const client = new Discord.Client();
client.commands = new Discord.Collection();
client.reactCommands = new Discord.Collection();

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
client.login(token);