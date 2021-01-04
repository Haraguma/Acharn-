const Discord = require("discord.js");
const fs = require("fs");
const client = new Discord.Client();
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')
const adapter = new FileSync('./db.json')
const db = low(adapter)
// Init discord giveaways
const bot = new Discord.Client();
bot.on("ready", () => {
  console.log("Ready");
  bot.user.setActivity("Acharné Discord");
})

// Requires Manager from discord-giveaways
const { GiveawaysManager } = require('discord-giveaways');
// Starts updating currents giveaways
const manager = new GiveawaysManager(client, {
    storage: './giveaways.json',
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        exemptPermissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
        embedColor: '#FF0000',
        reaction: '🎉'
    }
});
// We now have a giveawaysManager property to access the manager everywhere!
client.giveawaysManager = manager;
db.defaults({
    serveurs_on: []
}).write()


let config = require("./config.json");
client.config = config;

let now = new Date();
let hour = now.getHours();
let minute = now.getMinutes();
let second = now.getSeconds();
let times = (`[${hour}:${minute}:${second}]/`);

client.on('ready', () => {
    console.log(GiveawaysManager)
    console.log(times + `\x1b[33m%s\x1b[0m`, '[WARN]', '\x1b[0m', 'Connexion en cours...');
    console.log(times + `\x1b[33m%s\x1b[0m`, '[WARN]', '\x1b[0m', 'Connexion à l\'API Discord.js en cours...');
    console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Connexion à l\'API Discord.js effectuée');
    console.log(times + `\x1b[36m%s\x1b[0m`, '[INFO]', '\x1b[0m', 'Connecté sur ' + client.user.username + '#' + client.user.discriminator);
    console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Chargement terminé');
    console.log(times + `\x1b[32m%s\x1b[0m`, '[OK]', '\x1b[0m', 'Prêt et connecté');

});

client.login(config.token);

bot.login(process.env.TOKEN)

fs.readdir("./events/", (err, files) => {
    if (err) return console.error(err);
    files.forEach(file => {
        const event = require(`./events/${file}`);
        let eventName = file.split(".")[0];
        client.on(eventName, event.bind(null, client));
    });
});

client.commands = new Discord.Collection();

fs.readdir("./commands/", (err, content) => {
    if (err) console.log(err);
    if (content.length < 1) return console.log('Veuillez créer des dossiers dans le dossier commands !');
    var groups = [];
    content.forEach(element => {
        if (!element.includes('.')) groups.push(element); // Si c'est un dossier
    });
    groups.forEach(folder => {
        fs.readdir("./commands/" + folder, (e, files) => {
            let js_files = files.filter(f => f.split(".").pop() === "js");
            if (js_files.length < 1) return console.log('Veuillez créer des fichiers dans le dossier "' + folder + '" !');
            if (e) console.log(e);
            js_files.forEach(element => {
                let props = require('./commands/' + folder + '/' + element);
                client.commands.set(element.split('.')[0], props);
            });
        });
    });
});




client.on('message', message => {
    let server = message.guild.id;
    if (db.get("serveurs_on").find({ serveur: server }).value()) {
        const pub = [
            "discord.me",
            "discord.io",
            "discord.gg",
            "invite.me",
            "discordapp.com/invite",
        ];

        if (pub.some(word => message.content.includes(word))) {
            if (message.member.hasPermission("ADMINISTRATOR")) {
                return;
            }
            message.delete()
            var pub_detect = new Discord.MessageEmbed()
                .setTitle("⚠️ Une publicité viens d'être détecté automatiquement!")
                .addField("⚡__Utilisateur__ :", "<@" + message.author.id + ">")
                .addField("🔒 __Statut de la pub__ :", "Automatiquement supprimé.")
                .addField("📌 __Information__ :", "Si vous faites parti(e) de l'équipe, demandez à l'un de vos administrateurs de vous mettre la permission de gérer les messages.")
              
                .setColor("#FFCC4D")
            message.channel.send(pub_detect)
        }else {
            return;
        }
    }
})


const AntiSpam = require('discord-anti-spam');
const antiSpam = new AntiSpam({
  warnThreshold: 2, // Amount of messages sent in a row that will cause a warning.
  banThreshold: 4, // Amount of messages sent in a row that will cause a ban.
  maxInterval: 1000, // Amount of time (in milliseconds) in which messages are considered spam.
	warnMessage: '{@user}, Ne spam pas ..', // Message that will be sent in chat upon warning a user.
	kickMessage: '**{user_tag}** a été ban pour spam.', // Message that will be sent in chat upon banning a user.
	maxDuplicatesWarning: 2, // Amount of duplicate messages that trigger a warning.
	maxDuplicatesBan: 4, // Amount of duplicate messages that trigger a warning.
	exemptPermissions: [], // Bypass users with any of these permissions(These are not roles so use the flags from link above).
	ignoreBots: true, // Ignore bot messages.
	verbose: true, // Extended Logs from module.
	ignoredUsers: [], // Array of User IDs that get ignored.
	// And many more options... See the documentation.
});

client.on('message', (message) => antiSpam.message(message));


let antibots = JSON.parse(fs.readFileSync('./antibots.json' , 'utf8'));//require antihack.json file
client.on('message', message => {
  if(message.content.startsWith(config.prefix + "antibots on")) {
      if(!message.channel.guild) return message.reply('**Cette commande uniquement pour les serveurs**');
      if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send("**Désolé mais vous n'avez pas la permission** `ADMINISTRATOR`" );
antibots[message.guild.id] = {
onoff: 'On',
}
message.channel.send(`**✅ Le AntiBots est __𝐎𝐍__ !**`)
        fs.writeFile("./antibots.json", JSON.stringify(antibots), (err) => {
          if (err) console.error(err)
          .catch(err => {
            console.error(err);
        });
          });
        }


  if(message.content.startsWith(config.prefix + "antibots off")) {
      if(!message.channel.guild) return message.reply('**Cette commande uniquement pour les serveurs**');
      if(!message.member.hasPermission('ADMINISTRATOR')) return message.channel.send("**Désolé mais vous n'avez pas la permission** `ADMINISTRATOR`" );
antibots[message.guild.id] = {
onoff: 'Off',
}
message.channel.send(`**⛔ Le AntiBots est __𝐎𝐅𝐅__ !**`)
        fs.writeFile("./antibots.json", JSON.stringify(antibots), (err) => {
          if (err) console.error(err)
          .catch(err => {
            console.error(err);
          });
        });
        }

      })


      client.on("webhookUpdate", async channel => {
        let webhooks = channel.fetchWebhooks();
        let sizew = (await webhooks).size;
        if(sizew >= 1) {
          let webhook = (await webhooks).first()
          const channel = client.channels.cache.get("783763115392237599");
          if(channel) {
        let embedHook = new Discord.MessageEmbed()
              .setTitle("🔧 Création de Webhook")
              .setDescription(`Le webhook **${webhook.name}**, crée par **${webhook.owner}** dans le salon **${channel.name}** a été supprimé automatiquement.`)
              .setThumbnail(`${webhook.owner.avatarURL}`)
              .setFooter(`GDProtect`, client.user.avatarURL())
              .setTimestamp()
              .setColor("#007FFF")
              channel.send(embedHook);
              webhook.delete();
          }
        }
      });
    
      client.on("channelUpdate", async (old, newer) => {
        if(newer.type == "text") {
        let webhooks = newer.fetchWebhooks();
        let sizew = (await webhooks).size;
        if(sizew >= 1) {
          let webhook = (await webhooks).first()
          const channel = client.channels.cache.get("783763115392237599");
        let embedHook = new Discord.MessageEmbed()
              .setTitle("🔧 Création de Webhook")
              .setDescription(`Le webhook **${webhook.name}**, crée par **${webhook.owner}** dans le salon **${newer.name}** a été supprimé automatiquement.1`)
              .setThumbnail(webhook.owner.avatarURL)
              .setFooter(`GDProtect`, client.user.avatarURL())
              .setTimestamp()
              .setColor("#007FFF")
              channel.send(embedHook);
              webhook.delete();
        }
      }
      });
