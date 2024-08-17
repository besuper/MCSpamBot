# MCSpamBot
A Minecraft spam bot written in Node.js
It supports Minecraft versions from 1.7 to 1.21. Check the [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol) repository for the list of supported versions.

## Usage
```
node src/index.js host <ip> port <port> username <true/false> version 1.8.8 speed 120 threads 4
```

## Arguments
```
host | Target Minecraft server IP 
port | Target Minecraft server port 
username | If true, uses the usernames from the list 
version | Target Minecraft server version
speed | Milliseconds between each connection 
threads | Number of threads used to send the attack
```
This project uses [minecraft-protocol](https://github.com/PrismarineJS/node-minecraft-protocol)

## Supported proxies
You can use HTTP or SOCKS proxies. Create a file named `proxies.txt` and fill it with your proxies, one per line in the format `ip:port`.

## Warning
Please use this project only for development/testing purposes and only on servers where you have permission. This project should not be used for actual botting.