const asmt_queue = require('../sqlitedb');

module.exports = {
	name: 'help',
	aliases: [],
	description: 'displays the set of commands and their usage',
	usage: '!help [command]',
	execute(message, args, client){

		const commands_data = [];
		const { commands } = message.client;

		if(args.length > 0){
			if(!commands.has(args[0])){ message.channel.send('command does not exist, mb'); return; }
			command = commands.get(args[0]);
			commands_data.push(`**name:** ${command.name}\n**description:** ${command.description}\n**usage:** ${command.usage}`);
			message.author.send(commands_data.join(' '), { split: true });
		}
		else{
			commands_data.push("**AnyaBot** here! let's help you plan out your tasks and declutter your schedule. \n here are the commands i currently support:\n");
			commands.map((command, id) => {
				commands_data.push(` ***${command.name}***  |`);
			})
			var lastitem = commands_data.pop().slice(0, -2);
			commands_data.push(lastitem);
			commands_data.push(`✨`);
        		commands_data.push(`\n use !help [command] to receive a pm about it.`);
			message.channel.send(commands_data.join(' '), { split: true });
		}
	}
    
}