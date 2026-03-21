const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { removedUsers } = require('../utils/ticketManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('cleartimeout')
    .setDescription('Remove a user\'s ticket timeout so they can open a ticket again')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('The member to clear the timeout for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const member = interaction.options.getMember('member');

    if (!removedUsers.has(member.id)) {
      return interaction.reply({ content: `ℹ️ ${member} does not have an active timeout.`, ephemeral: true });
    }

    removedUsers.delete(member.id);
    await interaction.reply({ content: `✅ Timeout cleared for ${member}. They can now open tickets again.`, ephemeral: true });
  },
};
