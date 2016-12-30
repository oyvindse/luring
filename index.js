var irc = require('irc');
var cheerio = require('cheerio');
var fetch = require('node-fetch');
var phantomjs = require('phantomjs-prebuilt');
var yr = require('yr.no-forecast');
var adage = require('adage');
var query = require('game-server-query');

var busometer = require('./busometer.js');

var config = {
	channels: ["#testing123"],
	server: "irc.efnet.no",
	clientName: "noNameBot"
};

var client = new irc.Client(config.server, config.clientName, {
	channels: config.channels
});

var listeners = [];

client.addListener('message', function (from, to, message) {
    if("T-bane?".toUpperCase() === message.toUpperCase()) {
	    busometer.fetchRealtimeData("3012450", "2", "1", function(data) {
			     client.say(config.channels[0], "" + from + ": " + "Det er " + data + "min til neste bane fra Røa til sentrum");
  		});
    } else if('.' === message.charAt(0)) {
    	message = message.split('.');
    	message.shift();
			message = message.join('.');
      luring(message);
    }
});

function on(trigger, callback) {
	var clientListener = (f,t,m) => {
		if(''+trigger === ''+ m) {
			try {
				callback(f, t, m);
			} catch(err) {
				console.error(err);
			}
		}
	}
	listener = {trigger, callback, clientListener};
	listeners.push(listener);
	client.addListener('message', clientListener);
}

function off(trigger) {
	listeners.forEach((element, index) => {
		if (''+trigger === ''+element.trigger) {
			listeners.splice(index, 1);
			client.removeListener('message', element.clientListener);
		}
	});
}

function say(message) {
	client.say(config.channels[0], message);
}

function luring(message) {
	try {
		var e = eval(message);
	} catch (err) {
		console.error(err);
	}
}
