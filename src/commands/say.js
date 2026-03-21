const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('say')
    .setDescription('Make the bot say something in a channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addStringOption(opt =>
      opt.setName('message')
        .setDescription('What should the bot say?')
        .setRequired(true)
    )
    .addChannelOption(opt =>
      opt.setName('channel')
        .setDescription('Channel to send the message in (defaults to current)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const text = interaction.options.getString('message');
    const channel = interaction.options.getChannel('channel') || interaction.channel;

    await channel.send(text);
    await interaction.reply({ content: `✅ Message sent in ${channel}.`, ephemeral: true });
  },
};
