# Deploy to Railway (24/7 Hosting)

## Step 1 — Push to GitHub
1. Create a new GitHub repo (e.g. `my-crew-bot`)
2. Push the contents of this `discord-bot/` folder to it

## Step 2 — Create Railway Project
1. Go to [railway.app](https://railway.app) and sign in
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your bot repo

## Step 3 — Set Environment Variables
In Railway → your project → **Variables**, add:

| Variable | Value |
|---|---|
| `DISCORD_TOKEN` | Your bot token from Discord Developer Portal |
| `CLIENT_ID` | Your bot's Application ID from Developer Portal |
| `CREW_NAME` | Your crew name (e.g. `Straw Hat Crew`) |

## Step 4 — Deploy
Railway will automatically deploy. The bot will run 24/7.

---

## Bot Setup (Do this ONCE in your Discord server)
After the bot is running and invited to your server, type:
```
/setupserver
```
This will:
- Create the **join-crew** channel with the embed
- Create the **TICKETS** category
- Create Division 1-5 roles
- Post the Join Crew embed with the button

## Bot Commands

| Command | Description | Who Can Use |
|---|---|---|
| `/setupserver` | Set up entire server | Admin only |
| `/joincrew` | Post Join Crew embed here | Manage Channels |
| `/ticket [member]` | Open a ticket for someone | Manage Channels |
| `/closeticket` | Close current ticket | Manage Channels |
| `/assigndiv @member div` | Manually assign Division role | Manage Roles |
| `/clear [amount]` | Delete messages | Manage Messages |
| `/kick @member [reason]` | Kick a member | Kick Members |
| `/ban @member [reason]` | Ban a member | Ban Members |
| `/warn @member reason` | Warn a member | Moderate Members |
| `/say message [#channel]` | Bot says something | Manage Messages |
| `/ping` | Bot latency | Everyone |
| `/serverinfo` | Server info | Everyone |
| `/userinfo [@user]` | User info | Everyone |

## Required Bot Permissions
When inviting the bot, make sure it has:
- Manage Channels
- Manage Roles
- Manage Messages
- Read Messages / View Channels
- Send Messages
- Embed Links
- Attach Files
- Read Message History
- Kick Members
- Ban Members
