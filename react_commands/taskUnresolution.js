const asmt_queue = require('../sqlitedb');

module.exports = {
	emoji: '❎',
	aliases: [],
	description: 'unresolves the task reacted to from !schedule',
	usage: '',
	execute: async(reaction, user) => {

		var messageData = reaction.message.content.split('**');


		if(messageData.length < 2){ return; }
		const taskReacted = await asmt_queue.findOne({
			where: {
				asmtname:messageData[1],
				user: user.username
			}
		});
		
		if(taskReacted){
			reaction.message.channel.send('yikes \"' + messageData[1] + '\" was marked unresolved');
			await asmt_queue.update({ completed: false }, {
				where: {
					asmtname:messageData[1],
					user: user.username
				}
			});
		}
	
	},
};