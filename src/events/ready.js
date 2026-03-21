const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'ready',
  once: true,
  async execute(client) {
    console.log(`✅ Logged in as ${client.user.tag}`);
    client.user.setActivity('🏴‍☠️ Guarding the Crew', { type: 3 });

    const commands = [];
    const commandsPath = path.join(__dirname, '..', 'commands');
    const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

    for (const file of commandFiles) {
      const command = require(path.join(commandsPath, file));
      if (command.data) commands.push(command.data.toJSON());
    }

    const rest = new REST().setToken(process.env.DISCORD_TOKEN);

    try {
      await rest.put(
        Routes.applicationCommands(client.user.id),
        { body: commands },
      );
      console.log(`✅ Registered ${commands.length} slash commands globally.`);
    } catch (err) {
      console.error('Failed to register commands:', err);
    }
  },
};
