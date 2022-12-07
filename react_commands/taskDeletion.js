const asmt_queue = require('../sqlitedb');

module.exports = {
	emoji: '❌',
	aliases: [],
	description: 'removes the task reacted to from !schedule', 
	usage: '',
	execute: async(reaction, user) => {

		var messageData = reaction.message.content.split('**'); 

		if(messageData.length < 2){ return; }
		const taskReacted = await asmt_queue.findOne({
			where: {
				taskname:messageData[1],
				user: user.username
			}
		});
		
		if(taskReacted){
			reaction.message.channel.send('js, \"' + messageData[1] + '\" was removed');
			await asmt_queue.destroy({
				where: {
					taskname:messageData[1],
					user: user.username
				}
			});
		}
	
	},
};