function log(message) {
    const now = new Date();

    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    console.log(`[${now.getDate()}/${now.getMonth() + 1} ${hours <= 9 ? "0" + hours : hours}:${minutes <= 9 ? "0" + minutes : minutes}:${seconds <= 9 ? "0" + seconds : seconds}] [MCSpamBot] ${message}`);
}

module.exports = { log };