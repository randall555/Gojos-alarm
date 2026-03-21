const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('clear')
    .setDescription('Delete a number of messages from this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
    .addIntegerOption(opt =>
      opt.setName('amount')
        .setDescription('Number of messages to delete (1-100)')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(100)
    ),

  async execute(interaction) {
    const amount = interaction.options.getInteger('amount');
    await interaction.deferReply({ ephemeral: true });

    const deleted = await interaction.channel.bulkDelete(amount, true).catch(err => {
      console.error(err);
      return null;
    });

    if (!deleted) {
      return interaction.editReply({ content: '❌ Could not delete messages. Messages older than 14 days cannot be bulk deleted.' });
    }

    await interaction.editReply({ content: `✅ Deleted **${deleted.size}** message(s).` });
  },
};
