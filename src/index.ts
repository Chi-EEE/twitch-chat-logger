require('dotenv').config()
//Twurple
import { ApiClient, HelixStream } from '@twurple/api';
import { RefreshingAuthProvider } from '@twurple/auth';
import { ChatClient } from '@twurple/chat';
import { promises as fs } from 'fs';

//Discordjs
import { Client, Intents, TextChannel } from 'discord.js';
  
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
});

const NEED_ONLINE = true;
const REMOVE_DELETED = true; // If you don't want deleted messages then REMOVED_DELETED should be true

const MINUTE = 60000;
const STREAMER_NAME = process.env.STREAMER_NAME as string;

//Ensure the constants match the type as string before executing main
const clientId = process.env.clientId as string;
const clientSecret = process.env.clientSecret as string;

async function main() {
    client.on('ready', () => {
        console.log(`DiscordJs: Logged in as ${client.user!.tag}`); //Suppress null error
    })
    
    client.login(process.env.TOKEN);

    const tokenData = JSON.parse(await fs.readFile('./tokens.json', "utf-8"));
    const authProvider = new RefreshingAuthProvider(
        {
            clientId,
            clientSecret,
            onRefresh: async newTokenData => await fs.writeFile('./tokens.json', JSON.stringify(newTokenData, null, 4), 'utf-8')
        },
        tokenData
    );
    const apiClient = new ApiClient({ authProvider });

    streamOn();
    async function streamOn() {
        const stream = await apiClient.streams.getStreamByUserName(STREAMER_NAME) || !NEED_ONLINE; // If Channel is live then channel won't be null

        if (stream) {
            var messages = new Map<string, string>();
            var text: string = '';
            if (stream instanceof HelixStream) // Do stuff with stream
            {
                const date = new Date();
                console.log(`${stream.userName} went live within a 1 minute window at ${date.toUTCString()}!`);
            }
            const chatClient = new ChatClient({ authProvider, channels: [STREAMER_NAME] });
            await chatClient.connect();

            // Whenever someone chats in twitch channel, their message is put into a Map
            chatClient.onMessage((channel, user, message, msg) => {
                if (message)
                    messages.set(msg.id, `[${channel} | @${user}]: ${message}\n`);
            });

            if (REMOVE_DELETED)
            {
                chatClient.onMessageRemove((channel, messageId, msg) => {
                    messages.delete(messageId);
                })
            }

            async function getChat() {
                const date = new Date();

                for (const [messageId, message] of messages) {
                    text += message;
                }
                messages.clear();

                // Gets the channel which the bot will upload the chat into
                const DS_CHANNEL = client.channels.cache.get(process.env.CHANNEL_ID as string);
                
                await fs.writeFile('chat.txt', text, 'utf-8');
                (DS_CHANNEL as TextChannel).send({
                    files: [{
                        attachment: './chat.txt',
                        name: `${STREAMER_NAME} - ${date.toUTCString()}`
                      }]
                });
                await fs.unlink('chat.txt');
            }

            // Loop to check if the streamer is online
            async function loop() {
                getChat();
                const stream = await apiClient.streams.getStreamByUserName(STREAMER_NAME) || !NEED_ONLINE;
                if (stream) {
                    setTimeout(loop, MINUTE);
                }
                else {
                    setTimeout(streamOn, MINUTE); // Checks if stream is on after 1 minute
                }
            }
            setTimeout(loop, MINUTE);
        }
        else
        {
            setTimeout(streamOn, MINUTE);
        }
    };
}
main();
