const users = require("../sqlitedb-users");

module.exports = {
	name: 'reminder',
	aliases: [],
	description: 'sets a reminder for a given time, or for a given interval from the current time',
	usage: '!reminder [time(24 hours)] [reminder message]',
	execute: async(message, args) => {
	
		if(args.length < 1){
			message.channel.send('error: no time or time interval given bozo'); return;
		}
		
		var expectedArg1 = /(\d+)\:(\d+)/i;  

		if(args.length >= 1 && expectedArg1.test(args[0])){
			var time = args[0].match(expectedArg1);
			console.log(time); 
			
			if(time[1] < 0 || time[1] > 23 || time[2] < 0 || time[2] > 59){
				message.channel.send('error: time not valid bozo'); return;
			}
			
			var scheduledTime = new Date(); 
			scheduledTime.setHours(time[1]); scheduledTime.setMinutes(time[2]); scheduledTime.setSeconds(0); scheduledTime.setMilliseconds(0);
			var waitTime = scheduledTime.getTime() - (scheduledTime.getTimezoneOffset() * 60000) - Date.now();
			const userEntry = await users.findOne({ where: {user_id:message.author.id} });
			if(userEntry){

				var offset = await userEntry.get('timezone');
				waitTime -= offset;
			}

			if(waitTime < 0){ waitTime += 86400000; }

			if(args.length > 1){
				message.channel.send('reminder set.').then(() => {
					message.client.setTimeout(() => message.channel.send('***reminder:***' + args.slice(1).join(' ')), waitTime);
				});
				return;
			} else{
				var output = ''; var outputCalc = waitTime;
				if( outputCalc > 3600000 ){ 
					output += (Math.floor(outputCalc / 3600000)) + ' hour';
					if(Math.floor(outputCalc / 3600000) == 1){ output += ', '; }else{ output += 's, '; }
					outputCalc %= 3600000;
				}
				if( outputCalc > 60000 ){
					output += (Math.floor(outputCalc / 60000)) + ' minute';
					if(Math.floor(outputCalc / 60000) == 1){ output += ', '; }else{ output += 's, '; }
					outputCalc %= 60000;
				}
				if( outputCalc > 1000 ){
					output += (Math.floor(outputCalc / 1000)) + ' second';
					if(Math.floor(outputCalc / 1000) == 1){ output += ', '; }else{ output += 's, '; }
					outputCalc %= 1000;
				}
				message.channel.send('reminder set.').then(() => {
					message.client.setTimeout(() => message.channel.send('***reminder*** (set ' + output.slice(0, -2) + ' ago)'), waitTime); 
				});
				return;
			}
	
		}
	
		expectedArg1 = /^(\d+)$/i;
		var expectedArg2 = /^((?:hour)|(?:minute)|(?:second))s?$/i;

		if(args.length >= 2 && expectedArg1.test(args[0]) && expectedArg2.test(args[1])){  
			var timeValue = args[0].match(expectedArg1);
			var timeMeasurement = args[1].match(expectedArg2);
			
			var waitTime = 0;	
			if((/hours?/i).test(timeMeasurement[1])){ waitTime += 3600000 * timeValue[1]; }
			if((/minutes?/i).test(timeMeasurement[1])){ waitTime += 60000 * timeValue[1]; }
			if((/seconds?/i).test(timeMeasurement[1])){ waitTime += 1000 * timeValue[1]; }

			if(args.length > 2){
				message.channel.send('reminder set.').then(() => {
					message.client.setTimeout(() => message.channel.send('***reminder:*** ' + args.slice(2).join(' ')), waitTime);
				});
				return;
			} else{
				message.channel.send('reminder set.').then(() => {
					message.client.setTimeout(() => message.channel.send('***reminder*** (set ' + args[0] + ' ' + args[1] + ' ago)'), waitTime); 
				});
				return;
			}
		} 
		

		message.channel.send('error: wrong format bozo');
	
	},
};