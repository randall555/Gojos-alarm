const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('Member to warn')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('reason')
        .setDescription('Reason for the warning')
        .setRequired(true)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const member = interaction.options.getMember('member');
    const reason = interaction.options.getString('reason');

    try {
      await member.send({
        embeds: [
          new EmbedBuilder()
            .setTitle('⚠️ You have been warned')
            .setDescription(`You received a warning in **${interaction.guild.name}**.\n\n**Reason:** ${reason}`)
            .setColor(0xFF4500)
            .setTimestamp(),
        ],
      });
    } catch (e) {
      console.error('Could not DM member:', e.message);
    }

    const embed = new EmbedBuilder()
      .setTitle('⚠️ Member Warned')
      .addFields(
        { name: 'Member', value: `${member} (${member.user.tag})`, inline: true },
        { name: 'Reason', value: reason, inline: true },
        { name: 'Warned by', value: `${interaction.user.tag}`, inline: true },
      )
      .setColor(0xFF4500)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed] });
  },
};
