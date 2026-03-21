const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { CREW_COLOR } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('userinfo')
    .setDescription('Show information about a user')
    .addUserOption(opt =>
      opt.setName('user')
        .setDescription('The user to look up (defaults to yourself)')
        .setRequired(false)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser('user') || interaction.user;
    const member = interaction.guild.members.cache.get(user.id);

    const roles = member?.roles.cache
      .filter(r => r.id !== interaction.guild.id)
      .sort((a, b) => b.position - a.position)
      .map(r => `${r}`)
      .join(', ') || 'None';

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '🆔 User ID', value: user.id, inline: true },
        { name: '📅 Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:D>`, inline: true },
        { name: '📥 Joined Server', value: member ? `<t:${Math.floor(member.joinedTimestamp / 1000)}:D>` : 'N/A', inline: true },
        { name: '🎭 Roles', value: roles.length > 1024 ? roles.slice(0, 1021) + '...' : roles },
      )
      .setColor(CREW_COLOR)
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  },
};
