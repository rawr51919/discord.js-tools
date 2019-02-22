<div align="center">
  <br />
  <br />
  <p>
    <a href="https://discord.gg/HDvFY7z"><img src="https://discordapp.com/api/guilds/343572980351107077/widget.png" alt="Discord server" /></a>
    <a href="https://www.npmjs.com/package/discord.js-tools"><img src="https://img.shields.io/npm/v/discord.js-tools.svg" alt="NPM version" /></a>
    <a href="https://www.npmjs.com/package/discord.js-tools"><img src="https://img.shields.io/npm/dt/discord.js-tools.svg" alt="NPM downloads" /></a>
    <a href="https://www.npmjs.com/package/discord.js-tools"><img src="https://img.shields.io/npm/l/discord.js-tools.svg" alt="License" /></a>
  </p>
  <p>
    <a href="https://nodei.co/npm/handy-on-discord/"><img src="https://nodei.co/npm/discord.js-tools.png?downloads=true&stars=true" alt="NPM info" /></a>
  </p>
</div>

## Installation
**Node.js 6.0.0 or newer is required.**  
Ignore any warnings about unmet peer dependencies, as they're all optional.

```js
var tools = require('discord.js-tools');
```

### Required packages
- [discord.js](https://www.npmjs.com/package/discord.js) the core of this project (`npm install discord.js --save`)

## Functions

**Message Collector**
```js
tools.messageCollector(message, 'question', 'answer')

//You need to put the question someone has to answer Yes or No on in 'question'.
//And answer will be the output if someone says Yes.
//Message is the variable you use for the message event!
```

**Random Number/Word**
```js
console.log(tools.arrayRandom(['1', '2']))

//You can replace 1 or 2 by anthing you want and extend it so far as you want!
```

**Purge**
```js
tools.purge(message, client, amount)

//You can choose an amount between 1 and 99.
//Client is the variable you have for new Discord.Client();
//Message is the variable you use for the message event!
```

**Get a member with id/mention/username search**
```js
/**
msg - The msg object
args - (id / mention/ username search)
embedColor - The color for the embed
embedTime - Time to stop listening for a msg (miliseconds)
return a promise
**/
tools.fetchMember(message, args, embedColor, embedTime).then(member => {
   //a member as been found, you can now use member
   console.log(member);
}).catch(err => {
   //an error happen you should log it!
   console.log(err);
});

```

## Example usage
```js
var tools = require('discord-js-tools')

var prefix = {};

client.on('message', message => {
tools.messageCollector(message, 'do you like spikey yes or no?', 'i like him too!')

tools.arrayRandom(['1', '2', '3']).then({i =>
console.log(i)
})

if (message.content.startsWith(prefix + 'purge')) {
var amount = message.content.split(' ').slice(1);
      tools.purge(message, client, amount)
  }

});

client.on('ready', () => {
  console.log('Logged in!');
});

client.login('your token');
```
