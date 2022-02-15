//CREATED BY ALESSANDRO BAIO (February 2022)

const config = require("./config.json")

//WEBSITE
const app = require("express")();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const port = 3000;

app.get('/', (req, res) => {
    res.sendFile(__dirname + "/index.html")
})

io.on("connection", (socket) => {
    socket.on("message", msg => {
        io.emit("message", msg)
    })
})

http.listen(port, () => {
    console.log(`http://localhost:${port}/`)
});

//DISCORD
const { Client, Collection, Intents} = require("discord.js")
const client =  new Client({ intents: [Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS]});

client.login(config.token) 

client.on('ready', () => {
    console.log(client.user.tag)
    client.user.setActivity('/send', { type: 'LISTENING' });
});

client.on('messageCreate', async (message) => {
    //use the ..setup command to setup the slash command, then re-invite the bot
    if(message.content.toLowerCase().startsWith(config.prefix + "setup")) {
        const data = {
            name: "send",
            description: "Send a message to the website",
            options: [
                {
                    name: "text",
                    description: "The text you want to send",
                    type: "STRING",
                    required: true,
                }
            ]
        };
        await client.application?.commands.create(data);
        console.log("Success! I'm eady to use! Re-invite the bot and use the /send command.")
    }
})

client.on('interactionCreate', async (interaction) =>{
    if(!interaction.isCommand()) return;
    if(interaction.commandName == "send") {
        let msg = interaction.options.get("text").value
        let aut = interaction.user.tag
        io.emit("message", [aut, msg])
        interaction.reply({content: ":white_check_mark: Successfully sent!", ephemeral: true})
    }
})