// Thank you for using discord.js-tools!
// You can edit the configuration for some defaults in config.json

// Made for discord.js

// Functions: MessageCollector

// Require Packages

// Fetch Config
const fs = require('fs')
const request = require('request')
const config = require("./config.json");
const RegexWorld = require("regexworld");

// Functions
module.exports = {

    embed: function(channel, message, deleteTimer, hexColor) {
        channel.send({
            embed: {
                description: message,
                color: hexColor || config.defaultEmbedColorHEX
            }
        }).then(msg => {
            if (!isNaN(deleteTimer * 1000)) msg.delete(deleteTimer * 1000)
        })

    },
    
    purge: function(message, client, amount) {
 var messagecount = parseInt(amount)
 if (!amount || !message || !client) {
     console.log('message or amount or client is not defined!')
 return
     
 }
 
 if (isNaN(messagecount)) {
                console.log('AMOUNT is NOT A NUMBER');
            return;
            }
            
            if (!message.guild.member(message.author).hasPermission('MANAGE_MESSAGES')) {
                message.channel.send('You have Invalid Permissions!')
                return;
            }
            
            if (!message.guild.member(client.user).hasPermission('MANAGE_MESSAGES')) {
                message.channel.send('I have Invalid Permissions!')
                return;
            }

    if (messagecount < 2 || messagecount > 50) {
      message.delete();
      message.reply('pick a number **BETWEEN** 1 and 51')
        .then(message => {
          message.delete(6000);
        })
      return;
    }

    message.channel.fetchMessages({
      limit: messagecount + 1
    }).then(messages => message.channel.bulkDelete(messages));

    },

    messageCollector: function(oldmsg, message, reaction, time = '20000') {

        oldmsg.channel.send(`${message}`)
            .then(() => {
                oldmsg.channel.awaitMessages(response => ['yes', 'no'].includes(response.content.toLowerCase()) && response.author.id === oldmsg.author.id, {
                        max: 1,
                        time: `${time}`,
                        errors: ['time'],
                    })
                    .then((collected) => {

                        if (collected.first().content == 'yes') {
                            oldmsg.channel.send(`${reaction}`)
                        }

                        if (collected.first().content == 'no') {
                            return console.log('Nope')
                        }

                    })
                    .catch(() => {
                        oldmsg.channel.send(`Time ran out!`);
                    });
            });


    },

    arrayRandom: function(myArray) {
        return myArray[Math.floor(Math.random() * myArray.length)];
    },
    
    
    /**
     * Fetch a member from an id / mention / username search
     * @param {Message} msg - The msg object
     * @param {string} resolvable - (id / mention/ username search)
     * @param {string | color} embedColor - The color for the embed
     * @param {number} embedTime - Time to stop listening for a msg (miliseconds)
     * @return {Promise} Resolve user or reject if error
     **/
   "fetchMember": (msg, resolvable, embedColor = "RANDOM", embedTime = 60000) => {
       return new Promise(async(resolve, reject) => {
            let member = msg.guild.members.get(resolvable);
            if(member) return resolve(member);
            
            if (resolvable.toLowerCase().startsWith("<")) {
                RegexWorld
                    .setStr(resolvable)
                    .setRegex(/<.(\d+)>/gi)
                    .regexStart(null, (err, result) => {
                        if (err) return reject(err);
                        if (result[0][1]) {
                            member = msg.guild.members.get(result[0][1]);
                        }
                    });

                if (member) return resolve(member);
            }
            
            member = msg.guild.members.filterArray(m => {
                return m.user.username.toLowerCase().startsWith(resolvable.toLowerCase());
            });
            
            if(Array.isArray(member)) {
                if(member.length == 0) return reject("Couldn't found someone with this username");
                if(member.length == 1) return resolve(member[0]);
                
                let embed = {
                    "title": "Member search",
                    "color": embedColor,
                    "description": "Found more then 1 user for this search. Select the good user by sending the number for this user. Ex: 2",
                    "fields": []
                }
                
                member.forEach((mem, ind) => {
                    embed.fields.push({
                        "name": `**${ind + 1}**`,
                        "value": `${mem.user.username}(${mem.user.id})`
                    });
                });
                
                let msgToDel = await msg.channel.send({embed});
                
                let number = await msg.channel.awaitMessages(m => {
                    return m.author.id == msg.author.id;
                },{
                    "max": 1,
                    "time": embedTime,
                    "errors": ["time"]
                });
                
                msgToDel.delete();
                
                if(!number) return reject("Time ran out!");
                
                number = parseInt(number.first().content) - 1;
                
                if(!member[number]) return reject("This is not a valid number or a wrong number");
                
                return resolve(member[number]);
            } else return resolve(member);
       });
   }

}
