var irc = require('irc');
var cheerio = require('cheerio');
var fetch = require('node-fetch');
var phantomjs = require('phantomjs-prebuilt');
var yr = require('yr.no-forecast');
var adage = require('adage');
var query = require('game-server-query');
var path = require('path');
var fs = require('fs');

var busometer = require('./busometer.js');

var config = {
	channels: ["#testing123"],
	server: "irc.efnet.no",
	clientName: "noNameLuring"
};

var client = new irc.Client(config.server, config.clientName, {
	channels: config.channels
});

var storage = path.join(__dirname, 'storedProps.json');

var listeners = [];
var ignored = [];

setInterval(persist, 10000); // timed storage: temp every 10sec

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

function traverse(o, cb) {
  if (typeof o === 'undefined' || o === null) return '';
  if (Array.isArray(o)) {
    return o.map(function(e, i) {
      return traverse(e, cb);
    });
  } else if (typeof o === 'object') {
    console.log(o);
    if (('' + o).match(/^\/.*\/$/)) {
      return '' + o;
    }

    return Object.keys(o).reduce(function(o2, key) {
      o2[key] = traverse(o[key], cb);
      return o2;
    }, {});
  } else {
    return cb(o);
  }
}

function say(message) {
	client.say(config.channels[0], message);
}

//persist
//function keys() {
//return Object.keys(this).filter(function(key) {
 //   return ignored.indexOf(key) < 0;
 // });
//}

function toJSON(o) {
  o = traverse(o, function(o) {
    if (typeof o === 'function') {
      return '' + o;
    }
    return o;
  });
  return JSON.stringify(o);
}

function fromJSON(json) {
  var data = traverse(JSON.parse(json), function(o) {
    if (typeof o === 'string') {
      try {
        if (o.match(/^function|^\(\w*\)=>/)) {
          return eval('evalhack=' + o);
        } else if (o.match(/^\/.*\/$/)) {
          return eval(o);
        }
      } catch (e) {}
    }
    return o;
  });
  delete evalhack;
  return data;
}

function keys() {
  return Object.keys(this).filter(function(key) {
    return ignored.indexOf(key) < 0;
  });
}


setTimeout(function() {
  (function() {
    ignored = Object.keys(this);

    if (typeof this.listeners === 'undefined') {
      this.listeners = [];
    }
    if (typeof this.onload === 'undefined') {
      this.onload = [];
    }

    fs.readFile(storage, function(err, data) {
      var evaled;
      if (!err) {
        try {
          evaled = fromJSON(data);
          Object.keys(evaled).forEach(function(key) {
            this[key] = evaled[key];
          });
        } catch (e) {}
      }
      if (Array.isArray(this.listeners)) {
        this.listeners.forEach(function(listener) {
          addListener(listener);
        });
      }
    });
  }());
}, 1)

function persist() {
  var evaled = keys().reduce(function(o, key) {
    o[key] = this[key];
    return o;
  }, {});
  fs.writeFile(storage, toJSON(evaled));
  console.log('Wrote to file');
  console.log(evaled);
}


//!persist
function luring(message) {
	try {
		var e = eval(message);
	} catch (err) {
    console.error(err);
	}
}


