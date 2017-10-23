/**
 * Created by Kiran Kanaparthi.
 */

"use strict";

require('dotenv').config();

var Botkit = require('./lib/Botkit.js');
var os = require('os');
var http = require('http');
var request = require('request');

if (!process.env.clientId || !process.env.clientSecret || !process.env.port) {
    console.log('Error: Specify clientId clientSecret and port in environment');
    process.exit(1);
}

var controller = Botkit.glipbot({
    debug: true
}).configureGlipApp({
    clientId: process.env.clientId,
    clientSecret: process.env.clientSecret,
    redirectUri: process.env.redirectUri,
    apiRoot: process.env.apiRoot,
    accessToken: '',
    subscriptionId: ''
});


var bot = controller.spawn({});

controller.setupWebserver(process.env.port || 3000, function(err, webserver){
    controller.createWebhookEndpoints(webserver, bot,  function () {
        console.log("Online");
    });

    controller.createOauthEndpoints(webserver, bot, function(err, req, res) {
        if(err) {
            res.status(500).send('ERROR: ' + err);
        } else {
            res.send('Success!');
        }
    })

});

// Usage: uptime
controller.hears(['callcustomer'],'message_received',function(bot, message) {
    var hostname = os.hostname();
    var uptime = formatUptime(process.uptime());
    
    
   // bot.reply('Call is Initiated from the Customer Support to the Customer ' );
    
    var options = { method: 'POST',
    		  url: 'https://platform.devtest.ringcentral.com/restapi/v1.0/account/~/extension/~/ring-out',  headers: 
    		   { 'cache-control': 'no-cache',
    		     'accept': 'application/json',
    		     'content-type': 'application/json',
    		     'authorization': 'Bearer U0pDMTFQMDFQQVMwMHxBQUJwOWkzV1Y0WWtSaS1RYVVOZlFDTGdsOEFUNGJsdmsyU29zUmxfanJUUmVfZkozTmczYmVOZk9RclpWZTRuLWFaNF9QWWRPMEVYNENYQjd4dmJsWHJod0ZhZ2F1REEyNFBUbnJ2enFlcXBkaHdlUk9lU3lfNlNzbG1rRlE1S1lwVE1IUDZ6MXZOSi02T1pBNThZSklKVFZydXNieF9sOVFzVjJ0ZzFTbWw1NWNNdzRKMEZZY1hVN0dicDlhU1BPcVV8TFhXTU53fDdnbVk1cExqblFXdU93ZXlwbC11NGc' },
    		  body: 
    		   { from: { phoneNumber: '15106731240', forwardingNumberId: '' },
    		     to: { phoneNumber: '14157588631' },
    		     callerId: { phoneNumber: '' },
    		     playPrompt: false,
    		     country: { id: '1' } },
    		  json: true };

    		request(options, function (error, response, body) {
    		  if (error) throw new Error(error);

    		  console.log(body);
    		});
    		
    //	    bot.reply(message,'I am a bot! I have been running on getting the response ' + response.statusCode );

});

// Usage: question me
controller.hears(['question me'], 'message_received', function(bot,message) {

    // start a conversation to handle this response.
    bot.startConversation(message,function(err,convo) {

        convo.ask('Shall we proceed Say YES, NO or DONE to quit.',[
            {
                pattern: 'done',
                callback: function(response,convo) {
                    convo.say('OK you are done!');
                    convo.next();
                }
            },
            {
                pattern: bot.utterances.yes,
                callback: function(response,convo) {
                    convo.say('Great! I will continue...');
                    // do something else...
                    convo.next();

                }
            },
            {
                pattern: bot.utterances.no,
                callback: function(response,convo) {
                    convo.say('Perhaps later.');
                    // do something else...
                    convo.next();
                }
            },
            {
                default: true,
                callback: function(response,convo) {
                    // just repeat the question
                    convo.repeat();
                    convo.next();
                }
            }
        ]);

    })

});

//usage: pizzatime
controller.hears(['pizzatime'],'message_received',function(bot,message) {
    bot.startConversation(message, askFlavor);
});

var askFlavor = function(response, convo) {
    convo.ask("What flavor of pizza do you want?", function(response, convo) {
        convo.say("Awesome.");
        askSize(response, convo);
        convo.next();
    });
}

var askSize = function(response, convo) {
    convo.ask("What size do you want?", function(response, convo) {
        convo.say("Ok.")
        askWhereDeliver(response, convo);
        convo.next();
    });
}
var askWhereDeliver = function(response, convo) {
    convo.ask("So where do you want it delivered?", function(response, convo) {
        var message = null;
        message = "Ordered large pizza by Kiran\n\n"
        message += "[Ticket ##1001](www.dominos.com) - ordered large pizza\n\n"
        message += "**Description**\n\n"
        message += "Ordered large cheese pizza & should delivered at home\n\n"
        message += "**Priority**\n\n"
        message += "asap\n"
        convo.say(message);
        convo.next();
    });
}

controller.hears(['hi','hello'], 'message_received', function (bot, message) {
    bot.reply(message, "hi, you can ask me questions.");
});


function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}




