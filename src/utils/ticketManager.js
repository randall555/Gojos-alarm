const {
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { CREW_NAME, CREW_COLOR, TICKET_CATEGORY_NAME } = require('./config');

const activeTickets = new Map();

async function getOrCreateTicketCategory(guild) {
  let category = guild.channels.cache.find(
    c => c.type === ChannelType.GuildCategory &&
         c.name.toUpperCase() === TICKET_CATEGORY_NAME.toUpperCase()
  );

  if (!category) {
    category = await guild.channels.create({
      name: TICKET_CATEGORY_NAME,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.roles.everyone,
          deny: [PermissionFlagsBits.ViewChannel],
        },
      ],
    });
  }

  return category;
}

async function createTicket(guild, member) {
  const existing = activeTickets.get(member.id);
  if (existing) {
    const ch = guild.channels.cache.get(existing);
    if (ch) return { channel: ch, isNew: false };
  }

  const category = await getOrCreateTicketCategory(guild);

  const ticketChannel = await guild.channels.create({
    name: `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `Ticket for ${member.user.tag} | User ID: ${member.id}`,
    permissionOverwrites: [
      {
        id: guild.roles.everyone,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: guild.members.me.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.ReadMessageHistory,
        ],
      },
    ],
  });

  activeTickets.set(member.id, ticketChannel.id);

  const embed = new EmbedBuilder()
    .setTitle(`Welcome to your ticket, ${member.user.username}!`)
    .setDescription(
      `Hello ${member}! 👋\n\n` +
      `Welcome to **${CREW_NAME}** crew application!\n\n` +
      `**To join the crew, please:**\n` +
      `1. Send a **screenshot** of your in-game bounty\n` +
      `2. Do NOT just type your username or bounty number — you MUST provide a screenshot as proof\n\n` +
      `> ⚠️ If you send just your username or bounty without a screenshot, your message will be deleted.\n\n` +
      `Once your bounty is verified, you will be assigned your Division role automatically.`
    )
    .setColor(CREW_COLOR)
    .setFooter({ text: `${CREW_NAME} | Crew Application` })
    .setTimestamp();

  const closeRow = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('close_ticket')
      .setLabel('🔒 Close Ticket')
      .setStyle(ButtonStyle.Danger),
  );

  await ticketChannel.send({ content: `${member}`, embeds: [embed], components: [closeRow] });

  return { channel: ticketChannel, isNew: true };
}

async function closeTicket(channel, closedBy) {
  const userId = [...activeTickets.entries()].find(([, id]) => id === channel.id)?.[0];
  if (userId) activeTickets.delete(userId);

  const embed = new EmbedBuilder()
    .setTitle('🔒 Ticket Closed')
    .setDescription(`This ticket was closed by ${closedBy}.`)
    .setColor(0xff0000)
    .setTimestamp();

  await channel.send({ embeds: [embed] });

  await new Promise(r => setTimeout(r, 5000));
  await channel.delete('Ticket closed').catch(() => {});
}

module.exports = { createTicket, closeTicket, activeTickets };
