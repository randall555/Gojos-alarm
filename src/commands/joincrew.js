const {
  SlashCommandBuilder,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { CREW_NAME, CREW_COLOR } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('joincrew')
    .setDescription('Post the Join Crew embed in this channel')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const embed = new EmbedBuilder()
      .setTitle(`⚓ Join ${CREW_NAME}`)
      .setDescription(
        `**Welcome, Pirate!**\n\n` +
        `Are you ready to sail under the flag of **${CREW_NAME}**?\n\n` +
        `**How to Apply:**\n` +
        `> 1. Click the **Join the Crew** button below\n` +
        `> 2. A private ticket will open for you\n` +
        `> 3. Send a **screenshot** of your in-game bounty\n` +
        `> 4. You'll be automatically assigned your Division role!\n\n` +
        `**Division Requirements:**\n` +
        `🥇 **Division 1** — 3B+ Bounty\n` +
        `🥈 **Division 2** — 1B+ Bounty\n` +
        `🥉 **Division 3** — 500M+ Bounty\n` +
        `🔵 **Division 4** — 100M+ Bounty\n` +
        `🟢 **Division 5** — Under 100M\n\n` +
        `*Click the button below to open your application ticket!*`
      )
      .setColor(CREW_COLOR)
      .setFooter({ text: `${CREW_NAME} | Click the button below to apply!` })
      .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('join_crew')
        .setLabel('⚓ Join the Crew')
        .setStyle(ButtonStyle.Success),
    );

    await interaction.channel.send({ embeds: [embed], components: [row] });
    await interaction.editReply({ content: `✅ Join Crew embed posted!` });
  },
};
