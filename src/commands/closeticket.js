const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { closeTicket } = require('../utils/ticketManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('closeticket')
    .setDescription('Close the current ticket channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    const channel = interaction.channel;

    if (!channel.name.startsWith('ticket-')) {
      return interaction.reply({ content: '❌ This command can only be used inside a ticket channel.', ephemeral: true });
    }

    await interaction.reply({ content: '🔒 Closing ticket in 5 seconds...' });
    await closeTicket(channel, interaction.member.toString());
  },
};
