const asmt_queue = require('../sqlitedb');

module.exports = {
	emoji: '✅',
	aliases: [],
	description: 'resolves the task reacted to from !schedule',
	usage: '',
	execute: async(reaction, user, client) => {

		var messageData = reaction.message.content.split('**');


		const anyagif = ['https://thumbs.gfycat.com/AgilePoliticalAfricanparadiseflycatcher-size_restricted.gif',
                'https://media.tenor.com/bdvOWIGxp1EAAAAC/spy-x-family-spy-family.gif',
                'https://64.media.tumblr.com/f5d7c34fecdcdffc4b1839c5e74e0830/e12064a52ed0d543-61/s540x810/7c7dab9727f71a3eb000d3dbcca625e636ea74c7.gif',
                ]

		if(messageData.length < 2){ return; }
		const taskReacted = await asmt_queue.findOne({
			where: {
				asmtname:messageData[1],
				user: user.username
			}
		});
		
		if(taskReacted){
            const gif_num = Math.floor(Math.random() * 5);
			const gif_link = anyagif[gif_num];
			reaction.message.channel.send(' gj you have completed: \"***' + messageData[1] + '***\"', {files: [gif_link]});
			await asmt_queue.update({ completed: true }, {
				where: {
					asmtname:messageData[1],
					user: user.username
				}
			});
		}
	
	},
};