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
      .setTitle(`${CREW_NAME} Crew Recruitment!`)
      .setDescription(
        `**Please state the following information when you create your ticket:**\n\n` +
        `• Screenshot proof of your Roblox username, alongside your bounty.\n` +
        `• What region you are in and what platform you play on.\n\n` +
        `If you open a ticket and break one of these rules your ticket will be deleted in 1 hour.\n\n` +
        `**Bounty Requirements for Each Division:**\n\n` +
        `• 1st Division: 30M+\n` +
        `• 2nd Division: 20-29M\n` +
        `• 3rd Division: 10-20M\n` +
        `• 4th Division: 5-10M\n` +
        `• 5th Division: 0-5M`
      )
      .setColor(CREW_COLOR);

    const row1 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply_div1')
        .setLabel('DIV 1')
        .setEmoji('👑')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('apply_div2')
        .setLabel('DIV 2')
        .setEmoji('💜')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('apply_div3')
        .setLabel('DIV 3')
        .setEmoji('⚡')
        .setStyle(ButtonStyle.Secondary),
    );

    const row2 = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('apply_div4')
        .setLabel('DIV 4')
        .setEmoji('🔥')
        .setStyle(ButtonStyle.Secondary),
      new ButtonBuilder()
        .setCustomId('apply_div5')
        .setLabel('DIV 5')
        .setEmoji('🌿')
        .setStyle(ButtonStyle.Secondary),
    );

    await interaction.channel.send({ embeds: [embed], components: [row1, row2] });
    await interaction.editReply({ content: `✅ Join Crew embed posted!` });
  },
};
