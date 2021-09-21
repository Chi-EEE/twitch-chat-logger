# twitch-chat-logger
## Usage

### Files needed to be created:
- .env
- token.json

### Content in the listed files:
**.env:**
```
clientId = ClientIdFromTwitch
clientSecret = ClientSecretFromTwitch
TOKEN = BotTokenFromDiscord
CHANNEL_ID = ChannelIdFromDiscord
```
**token.json:**
```
{
	"accessToken": "0123456789abcdefghijABCDEFGHIJ",
	"refreshToken": "eyJfaWQmNzMtNGCJ9%6VFV5LNrZFUj8oU231/3Aj",
	"expiresIn": 0,
	"obtainmentTimestamp": 0
}
```
>The values in the listed files need to be changed in order for this program to run

This program was made using [Discord.js](https://discord.js.org/#/) and [Twurple.js](https://twurple.js.org/).
