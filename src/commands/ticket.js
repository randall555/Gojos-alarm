const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { createTicket } = require('../utils/ticketManager');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a crew application ticket for a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('Member to open a ticket for (defaults to yourself)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const target = interaction.options.getMember('member') || interaction.member;
    const { channel, isNew } = await createTicket(interaction.guild, target);

    const embed = new EmbedBuilder()
      .setDescription(
        isNew
          ? `✅ Ticket created for ${target}: ${channel}`
          : `ℹ️ ${target} already has an open ticket: ${channel}`
      )
      .setColor(isNew ? 0x00ff00 : 0xffaa00);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setLabel('Go to Ticket')
        .setStyle(ButtonStyle.Link)
        .setURL(`https://discord.com/channels/${interaction.guild.id}/${channel.id}`),
    );

    await interaction.editReply({ embeds: [embed], components: [row] });
  },
};
