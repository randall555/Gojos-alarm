const {
  SlashCommandBuilder,
  ChannelType,
  PermissionFlagsBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { CREW_NAME, CREW_COLOR } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setupserver')
    .setDescription('Set up the entire Nightmare Crew server with all channels, roles, and embeds')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });
    const guild = interaction.guild;

    try {
      await interaction.editReply({ content: '⚙️ Setting up roles...' });
      await setupRoles(guild);

      await interaction.editReply({ content: '⚙️ Setting up channels...' });
      const channels = await setupChannels(guild);

      await interaction.editReply({ content: '⚙️ Posting embeds...' });
      await postEmbeds(guild, channels);

      await interaction.editReply({
        content:
          `✅ **${CREW_NAME} server fully set up!**\n\n` +
          `**Roles created:** Staff, 1st–5th Division, Member, Guest\n` +
          `**Categories created:** 📋 Info, 📣 Crew, 💬 General, 🎫 Applications, 🔒 Staff, 📊 Logs\n` +
          `**Channels created:** rules, announcements, join-crew, general, crew-chat, and more\n\n` +
          `Type \`/joincrew\` in the join-crew channel to post the recruitment embed!`,
      });
    } catch (err) {
      console.error('Setup error:', err);
      await interaction.editReply({ content: `❌ Setup failed: ${err.message}` });
    }
  },
};

async function setupRoles(guild) {
  const roles = [
    { name: 'Owner', color: 0xFF0000, hoist: true, position: 10 },
    { name: 'Co-Owner', color: 0xFF4500, hoist: true },
    { name: 'Staff', color: 0xFFA500, hoist: true },
    { name: '1st Division', color: 0xFFD700, hoist: true },
    { name: '2nd Division', color: 0xC0C0C0, hoist: true },
    { name: '3rd Division', color: 0xCD7F32, hoist: true },
    { name: '4th Division', color: 0x4169E1, hoist: true },
    { name: '5th Division', color: 0x228B22, hoist: true },
    { name: 'Member', color: 0x9B59B6, hoist: false },
    { name: 'Guest', color: 0x808080, hoist: false },
  ];

  for (const r of roles) {
    const exists = guild.roles.cache.find(gr => gr.name === r.name);
    if (!exists) {
      await guild.roles.create({ name: r.name, color: r.color, hoist: r.hoist ?? false, reason: 'Server setup' });
    }
  }
}

async function setupChannels(guild) {
  const created = {};

  const infoCategory = await ensureCategory(guild, '📋 INFO');
  const crewCategory = await ensureCategory(guild, '📣 CREW');
  const generalCategory = await ensureCategory(guild, '💬 GENERAL');
  const applyCategory = await ensureCategory(guild, '🎫 APPLICATIONS');
  const ticketsCategory = await ensureCategory(guild, '🎟️ TICKETS');
  const staffCategory = await ensureCategory(guild, '🔒 STAFF', true);
  const logsCategory = await ensureCategory(guild, '📊 LOGS', true);

  created.rules = await ensureChannel(guild, '📜・rules', ChannelType.GuildText, infoCategory, true);
  created.announcements = await ensureChannel(guild, '📣・announcements', ChannelType.GuildText, infoCategory, true);
  created.roles = await ensureChannel(guild, '🎭・roles-info', ChannelType.GuildText, infoCategory, true);
  created.welcome = await ensureChannel(guild, '👋・welcome', ChannelType.GuildText, infoCategory, true);

  created.crewAnnouncements = await ensureChannel(guild, '📢・crew-announcements', ChannelType.GuildText, crewCategory, true);
  created.crewChat = await ensureChannel(guild, '💬・crew-chat', ChannelType.GuildText, crewCategory);
  created.crewMedia = await ensureChannel(guild, '🖼️・crew-media', ChannelType.GuildText, crewCategory);
  created.crewVc = await ensureChannel(guild, '🔊 Crew VC', ChannelType.GuildVoice, crewCategory);

  created.general = await ensureChannel(guild, '💬・general', ChannelType.GuildText, generalCategory);
  created.offTopic = await ensureChannel(guild, '🎲・off-topic', ChannelType.GuildText, generalCategory);
  created.media = await ensureChannel(guild, '🖼️・media', ChannelType.GuildText, generalCategory);
  created.botCommands = await ensureChannel(guild, '🤖・bot-commands', ChannelType.GuildText, generalCategory);
  created.generalVc = await ensureChannel(guild, '🔊 General VC', ChannelType.GuildVoice, generalCategory);

  created.joinCrew = await ensureChannel(guild, '🏴‍☠️・join-crew', ChannelType.GuildText, applyCategory, true);

  created.staffChat = await ensureChannel(guild, '💬・staff-chat', ChannelType.GuildText, staffCategory);
  created.staffCommands = await ensureChannel(guild, '🤖・staff-commands', ChannelType.GuildText, staffCategory);

  created.ticketLogs = await ensureChannel(guild, '📋・ticket-logs', ChannelType.GuildText, logsCategory);
  created.modLogs = await ensureChannel(guild, '🔨・mod-logs', ChannelType.GuildText, logsCategory);

  return created;
}

async function postEmbeds(guild, channels) {
  await postRulesEmbed(channels.rules);
  await postRolesEmbed(channels.roles);
  await postWelcomeEmbed(channels.welcome);
  await postJoinCrewEmbed(channels.joinCrew);
}

async function postRulesEmbed(channel) {
  if (!channel) return;
  const messages = await channel.messages.fetch({ limit: 10 });
  if (messages.some(m => m.author.id === channel.guild.members.me.id)) return;

  const embed = new EmbedBuilder()
    .setTitle(`📜 ${CREW_NAME} Rules`)
    .setDescription(
      `**Follow these rules or face consequences.**\n\n` +
      `**1.** Respect all members — no harassment, racism, or toxicity.\n` +
      `**2.** No spamming or flooding any channels.\n` +
      `**3.** No advertising other servers or crews.\n` +
      `**4.** Keep content in the correct channels.\n` +
      `**5.** No NSFW content of any kind.\n` +
      `**6.** Follow Discord's Terms of Service at all times.\n` +
      `**7.** Staff decisions are final — do not argue in public channels.\n` +
      `**8.** No leaking crew information to outsiders.\n\n` +
      `*Breaking rules will result in warnings, kicks, or permanent bans.*`
    )
    .setColor(CREW_COLOR)
    .setFooter({ text: `${CREW_NAME} | Read and follow the rules` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

async function postRolesEmbed(channel) {
  if (!channel) return;
  const messages = await channel.messages.fetch({ limit: 10 });
  if (messages.some(m => m.author.id === channel.guild.members.me.id)) return;

  const embed = new EmbedBuilder()
    .setTitle(`🎭 ${CREW_NAME} Roles & Divisions`)
    .setDescription(
      `**Staff Roles:**\n` +
      `👑 **Owner** — Server owner\n` +
      `🔴 **Co-Owner** — Co-leader of the crew\n` +
      `🟠 **Staff** — Server moderators\n\n` +
      `**Division Roles (by bounty):**\n` +
      `🥇 **1st Division** — 30M+ Bounty\n` +
      `🥈 **2nd Division** — 20M–29M Bounty\n` +
      `🥉 **3rd Division** — 10M–20M Bounty\n` +
      `🔵 **4th Division** — 5M–10M Bounty\n` +
      `🟢 **5th Division** — 0M–5M Bounty\n\n` +
      `**Other Roles:**\n` +
      `💜 **Member** — Verified crew member\n` +
      `⚪ **Guest** — Not yet verified\n\n` +
      `*Apply for a division in <#` + channel.guild.channels.cache.find(c => c.name.includes('join-crew'))?.id + `> !*`
    )
    .setColor(CREW_COLOR)
    .setFooter({ text: `${CREW_NAME} | Division info` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

async function postWelcomeEmbed(channel) {
  if (!channel) return;
  const messages = await channel.messages.fetch({ limit: 10 });
  if (messages.some(m => m.author.id === channel.guild.members.me.id)) return;

  const embed = new EmbedBuilder()
    .setTitle(`👋 Welcome to ${CREW_NAME}!`)
    .setDescription(
      `We're glad you're here, pirate! ⚓\n\n` +
      `**Getting started:**\n` +
      `> 📜 Read the rules in <#` + channel.guild.channels.cache.find(c => c.name.includes('rules'))?.id + `>\n` +
      `> 🎭 Check your division info in <#` + channel.guild.channels.cache.find(c => c.name.includes('roles-info'))?.id + `>\n` +
      `> 🏴‍☠️ Apply to join in <#` + channel.guild.channels.cache.find(c => c.name.includes('join-crew'))?.id + `>\n\n` +
      `*Set sail and prove your worth!* 🏴‍☠️`
    )
    .setColor(CREW_COLOR)
    .setFooter({ text: `${CREW_NAME} | Welcome aboard!` })
    .setTimestamp();

  await channel.send({ embeds: [embed] });
}

async function postJoinCrewEmbed(channel) {
  if (!channel) return;
  const messages = await channel.messages.fetch({ limit: 10 });
  if (messages.some(m => m.author.id === channel.guild.members.me.id && m.components.length > 0)) return;

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
    new ButtonBuilder().setCustomId('apply_div1').setLabel('DIV 1').setEmoji('👑').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('apply_div2').setLabel('DIV 2').setEmoji('💜').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('apply_div3').setLabel('DIV 3').setEmoji('⚡').setStyle(ButtonStyle.Secondary),
  );
  const row2 = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('apply_div4').setLabel('DIV 4').setEmoji('🔥').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('apply_div5').setLabel('DIV 5').setEmoji('🌿').setStyle(ButtonStyle.Secondary),
  );

  await channel.send({ embeds: [embed], components: [row1, row2] });
}

async function ensureCategory(guild, name, staffOnly = false) {
  let cat = guild.channels.cache.find(c => c.type === ChannelType.GuildCategory && c.name === name);
  if (cat) return cat;

  const overwrites = [{ id: guild.roles.everyone, deny: [PermissionFlagsBits.ViewChannel] }];

  if (!staffOnly) {
    overwrites.push({ id: guild.roles.everyone, allow: [PermissionFlagsBits.ViewChannel] });
  } else {
    const staffRole = guild.roles.cache.find(r => r.name === 'Staff');
    if (staffRole) overwrites.push({ id: staffRole.id, allow: [PermissionFlagsBits.ViewChannel] });
  }

  return guild.channels.create({ name, type: ChannelType.GuildCategory, permissionOverwrites: overwrites });
}

async function ensureChannel(guild, name, type, parent, readOnly = false) {
  let ch = guild.channels.cache.find(c => c.name === name && c.type === type);
  if (ch) return ch;

  const options = { name, type, parent: parent?.id };

  if (readOnly && type === ChannelType.GuildText) {
    options.permissionOverwrites = [
      { id: guild.roles.everyone, deny: [PermissionFlagsBits.SendMessages] },
      { id: guild.members.me.id, allow: [PermissionFlagsBits.SendMessages] },
    ];
  }

  return guild.channels.create(options);
}
