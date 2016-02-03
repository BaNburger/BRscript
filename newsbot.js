/*
~~~~~~~~~~INIT~~~~~~~~~~
*/

var Botkit = require("./lib/Botkit.js")
var cleverbot = require("cleverbot.io")
var os = require("os");

//set up the storage system for incoming messages
var controller = Botkit.slackbot({
  debug: false,
  log: true,
  json_file_store: "newsstand"
});

/*
Introducting cleverbot
cleverbot user ID: AUuXNJDye8jGoJNN
cleverbot API key: g3vvJqe3jg2LPTeKM2zVvCiykpzCDrad
*/
var cleverbot = new cleverbot("AUuXNJDye8jGoJNN", "g3vvJqe3jg2LPTeKM2zVvCiykpzCDrad");
cleverbot.setNick("Newsbot");
cleverbot.create(function(err, session){
	if(err){
		console.log("Could not create Cleverbot");
	}
});

/*
Introducting botkit
botkit API key: xoxb-19075635684-lV3WG0s4wFryfQJxVqP8jDT1
*/
var bot = controller.spawn({
	token:"xoxb-19075635684-lV3WG0s4wFryfQJxVqP8jDT1"
});
bot.startRTM(function(err, bot, payload){
	if(err){
		throw new Error("Could not connect to Slack");
	}
});

//testing newsbot
bot.api.channels.list({"exclude_archived":1}, function(err, res){
	console.log("PUBLIC GROUPS");
	console.log(res)
});
bot.api.groups.list({"exclude_archived":1}, function(err, res){
	console.log("PRIVATE GROUPS");
	console.log(res)
});


/*
~~~~~~~~~~MAIN~~~~~~~~~~
*/

//controller to shut down the bot for maintenance purposes
controller.hears("good night", "direct_message", function(bot,message) {

  bot.startConversation(message,function(err,convo) {
    convo.ask("Are you sure you want me to shutdown?",[
      {
        pattern: bot.utterances.yes,
        callback: function(response,convo) {
          convo.say("Bye!");
          convo.next();
          setTimeout(function() {
            process.exit();
          },3000);
        }
      },
      {
        pattern: bot.utterances.no,
        default:true,
        callback: function(response,convo) {
          convo.say("*Phew!*");
          convo.next();
        }
      }
    ])
  });
});

//introduction sequence
controller.hears("introduce yourself", "direct_mention,mention,direct_message", function(bot,message){
	bot.startConversation(message,function(err,convo){
		convo.say("Hello, friendo. Nice to finally meet you! :smile:");
		convo.next();
		convo.say("My name is Bert Newsbot, and I am a Slack bot made for marketing :robot_face:");
		convo.next();
		convo.say("It is my task to get newsworthy stories and from you!");
		convo.next();
		convo.say("So every time you find something you think would make good content for the blog, just add me to your message.")
		convo.next();
		convo.say("I am active in most channels and you can also chat with me directly. :grin:");
		convo.next()
	});
});

//controller to react to all channel messages
controller.on("direct_mention,mention", function(bot, message){
	bot.api.reactions.add({
	    timestamp: message.ts,
    	channel: message.channel,
    	name: "newspaper",
	},function(err,res) {
    	if (err) {
    		bot.botkit.log("Failed to add emoji",err);
    	}
	});


	controller.storage.channels.save({id:message.channel, time:message.ts, content:message.text}, function(err){
		if(err) {
			console.log(err)
		} else {
			console.log(message.text)
		}
	});


	controller.storage.users.get(message.user,function(err,user) {
		if (user && user.name) {
			bot.reply(message,"Alright, " + user.name + ". Thank you! :simple_smile:");
		} else {
    		bot.reply(message,"Alright, got it. Thank you! :simple_smile:");
    	}
	});
});

//handling of dicect messages
controller.hears(["for you","use","take","need"], "direct_message", function(bot, message){
	bot.api.reactions.add({
	    timestamp: message.ts,
    	channel: message.channel,
    	name: "newspaper",
	},function(err,res) {
    	if (err) {
    		bot.botkit.log("Failed to add emoji",err);
    	}
	});

	controller.storage.users.save({id:message.user, time:message.ts, content:message.text}, function(err){
		if(err) {
			console.log(err)
		} else {
			console.log(message.text)
		}
	});


	controller.storage.users.get(message.user,function(err,user) {
		if (user && user.name) {
			bot.reply(message,"Well, " + user.name + ". I'll see how I can use that! :simple_smile:");
		} else {
    		bot.reply(message,"Well, thank you. I'll see how I can use that! :simple_smile:");
    	}
	});
});

controller.on("direct_message", function(bot, message){
	var msg = message.text;
	cleverbot.ask(msg, function(err, response){
		if(!err){
			bot.reply(message, response);
		} else {
			console.log(err)
		}
	});
});
