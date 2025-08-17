const { defaultEmbedColorHEX } = require("./config.json");
const { setStr } = require("regexworld");
const packageJson = require("./package.json");

module.exports = {
  version: packageJson.version,

  // --- embed ---
  embed: async function (channel, message, deleteTimer, hexColor) {
    const msg = await channel.send({
      embed: {
        description: message,
        color: hexColor || defaultEmbedColorHEX
      }
    });
    if (!isNaN(deleteTimer * 1000)) await msg.delete(deleteTimer * 1000);
  },

  // --- purge ---
  purge: async function (message, client, amount) {
    const messagecount = parseInt(amount);
    if (!amount || !message || !client) {
      console.log("message or amount or client is not defined!");
      return;
    }

    if (isNaN(messagecount)) {
      console.log("AMOUNT is NOT A NUMBER");
      return;
    }

    if (message.channel.type !== "dm") {
      if (!message.member.hasPermission("MANAGE_MESSAGES") && message.guild.me.hasPermission("MANAGE_MESSAGES")) {
        await message.channel.send("You have invalid permissions!");
        return;
      } else if (!message.guild.me.hasPermission("MANAGE_MESSAGES") && message.member.hasPermission("MANAGE_MESSAGES")) {
        await message.channel.send("I have invalid permissions!");
        return;
      } else if (!message.member.hasPermission("MANAGE_MESSAGES") && !message.guild.me.hasPermission("MANAGE_MESSAGES")) {
        await message.channel.send("Both you and I have invalid permissions!");
        return;
      }
    }

    if (messagecount < 1 || messagecount > 99) {
      await message.delete();
      const replyMsg = await message.reply("pick a number **BETWEEN** 1 and 99");
      await replyMsg.delete(6000);
      return;
    }

    const messages = await message.channel.messages.fetch({ limit: messagecount + 1 });
    await message.channel.bulkDelete(messages);
  },

  // --- messageCollector ---
  messageCollector: async function (oldmsg, message, reaction, time = "20000") {
    await oldmsg.channel.send(`${message}`);
    try {
      const collected = await oldmsg.channel.awaitMessages(
        response => ["yes", "no"].includes(response.content.toLowerCase()) && response.author.id === oldmsg.author.id,
        { max: 1, time: parseInt(time), errors: ["time"] }
      );

      if (collected.first().content === "yes") await oldmsg.channel.send(`${reaction}`);
      if (collected.first().content === "no") return console.log("Nope");
    } catch {
      await oldmsg.channel.send("Time ran out!");
    }
  },

  // --- arrayRandom ---
  arrayRandom: function (myArray) {
    return myArray[Math.floor(Math.random() * myArray.length)];
  },

  // --- fetchMember ---
  fetchMember: (msg, resolvable, embedColor = "RANDOM", embedTime = 60000) => {
    const parseMention = (text) => {
      return new Promise((resolve, reject) => {
        setStr(text)
          .setRegex(/<.(\d+)>/gi)
          .regexStart(null, (err, result) => {
            if (err) {
              return reject(
                err instanceof Error ? err : new Error(String(err))
              );
            }
            if (result[0][1]) {
              return resolve(msg.guild.members.cache.get(result[0][1]) || null);
            }
            resolve(null);
          });
      });
    };

    const askUserToSelect = async (arr) => {
      const embed = {
        title: "Member search",
        color: embedColor,
        description: "Found more than 1 user. Select the correct user by sending the number. Ex: 2",
        fields: arr.map((mem, ind) => ({
          name: `**${ind + 1}**`,
          value: `${mem.user.username}(${mem.user.id})`
        })),
      };

      const msgToDel = await msg.channel.send({ embed });
      try {
        const collected = await msg.channel.awaitMessages(
          m => m.author.id === msg.author.id,
          { max: 1, time: embedTime, errors: ["time"] }
        );
        await msgToDel.delete();
        const index = parseInt(collected.first().content) - 1;
        if (!arr[index]) throw new Error("This is not a valid number or a wrong number");
        return arr[index];
      } catch (e) {
        await msgToDel.delete();
        throw new Error("Time ran out!" + e.message);
      }
    };

    const fetchMemberAsync = async () => {
      let member = msg.guild.members.cache.get(resolvable);
      if (member) return member;

      if (resolvable.toLowerCase().startsWith("<")) {
        member = await parseMention(resolvable);
        if (member) return member;
      }

      const membersMap = msg.guild.members.cache.filter(m =>
        m.user.username.toLowerCase().startsWith(resolvable.toLowerCase())
      );
      const arr = Array.from(membersMap.values());

      if (arr.length === 0) throw new Error("Couldn't find someone with this username");
      if (arr.length === 1) return arr[0];

      return await askUserToSelect(arr);
    };

    return fetchMemberAsync();
  }
};
