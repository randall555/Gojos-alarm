const { EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const { isLikelyBountyScreenshot, extractBountyFromScreenshot } = require('../utils/screenshotAnalyzer');
const { getDivisionForBounty, formatBounty } = require('../utils/bountyParser');
const { CREW_COLOR, BOUNTY_ROLES } = require('../utils/config');
const { removedUsers } = require('../utils/ticketManager');

const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,32}$/;
const BOUNTY_NUMBER_PATTERN = /^[\d,\.]+\s*(B(?:illion)?|M(?:illion)?|K(?:thousand)?)?$/i;

const warnCount = new Map();

function isPlainUsernameOrBounty(content) {
  const trimmed = content.trim();

  if (trimmed.length > 100) return false;

  const words = trimmed.split(/\s+/);
  if (words.length > 5) return false;

  if (USERNAME_PATTERN.test(trimmed)) return true;
  if (BOUNTY_NUMBER_PATTERN.test(trimmed)) return true;

  const cleanedNum = trimmed.replace(/[,\.]/g, '').replace(/\s*(B|M|K|billion|million|thousand)\s*/i, '');
  if (/^\d+$/.test(cleanedNum) && cleanedNum.length >= 6) return true;

  return false;
}

module.exports = {
  name: 'messageCreate',
  async execute(message, client) {
    if (message.author.bot) return;

    const channel = message.channel;
    if (!channel.name || !channel.name.startsWith('ticket-')) return;

    const hasImage = message.attachments.some(a => isLikelyBountyScreenshot(a));

    if (hasImage) {
      const imageAttachment = message.attachments.find(a => isLikelyBountyScreenshot(a));
      await handleScreenshot(message, imageAttachment);
      return;
    }

    const content = message.content.trim();
    if (!content) return;

    if (isPlainUsernameOrBounty(content)) {
      try { await message.delete(); } catch (e) {}

      const key = `${channel.id}-${message.author.id}`;
      const count = (warnCount.get(key) || 0) + 1;
      warnCount.set(key, count);

      if (count >= 2) {
        warnCount.delete(key);
        removedUsers.add(message.author.id);

        const kickEmbed = new EmbedBuilder()
          .setTitle('🚫 Removed from Ticket')
          .setDescription(
            `${message.author}, you have been removed from this ticket for repeatedly sending your username or bounty without proof.\n\n` +
            `You are no longer able to open tickets. Contact a staff member if you believe this was a mistake.`
          )
          .setColor(0x9B59B6)
          .setTimestamp();

        await channel.send({ content: `${message.author}`, embeds: [kickEmbed] });

        await channel.permissionOverwrites.edit(message.author.id, {
          ViewChannel: false,
          SendMessages: false,
        }).catch(err => console.error('Could not remove user from ticket:', err.message));

        await new Promise(r => setTimeout(r, 8000));
        await channel.delete('User removed after 2 warnings').catch(() => {});

        return;
      }

      const warningEmbed = new EmbedBuilder()
        .setTitle(`⚠️ Warning ${count}/2`)
        .setDescription(
          `${message.author}, your message was deleted because you sent just your username or bounty number without proof.\n\n` +
          `**If you do not show proof (a screenshot), I will unfortunately have to kick you out of the ticket.**\n\n` +
          `You have **${2 - count}** warning(s) left before you are removed.\n\n` +
          `Please send a **screenshot** of your in-game bounty to verify.`
        )
        .setColor(0xFF4500)
        .setTimestamp();

      const warning = await channel.send({ content: `${message.author}`, embeds: [warningEmbed] });
      setTimeout(() => warning.delete().catch(() => {}), 30_000);
    }
  },
};

async function handleScreenshot(message, attachment) {
  const channel = message.channel;
  const member = message.member;

  const processingMsg = await channel.send({
    embeds: [
      new EmbedBuilder()
        .setDescription('🔍 Analyzing your bounty screenshot...')
        .setColor(0xFFAA00),
    ],
  });

  try {
    const result = await extractBountyFromScreenshot(attachment);

    if (result) {
      const { bounty, division } = result;
      await assignDivisionRole(member, division, channel);

      const embed = new EmbedBuilder()
        .setTitle('✅ Bounty Verified!')
        .setDescription(
          `${member} your bounty of **${formatBounty(bounty)}** has been verified!\n\n` +
          `You have been assigned the **${division}** role!`
        )
        .setColor(CREW_COLOR)
        .setTimestamp();

      await processingMsg.edit({ embeds: [embed] });
    } else {
      const embed = new EmbedBuilder()
        .setTitle('📸 Screenshot Received')
        .setDescription(
          `${member}, your screenshot was received!\n\n` +
          `A staff member will verify your bounty and assign your Division role shortly.`
        )
        .setColor(0xFFAA00)
        .setTimestamp();

      const row = buildManualDivisionRow();
      await processingMsg.edit({ embeds: [embed], components: [row] });
    }
  } catch (err) {
    console.error('Screenshot processing error:', err);
    const embed = new EmbedBuilder()
      .setTitle('📸 Screenshot Received')
      .setDescription(
        `${member}, your screenshot has been received!\n` +
        `A staff member will review it and assign your Division role.`
      )
      .setColor(0x00AAFF)
      .setTimestamp();

    await processingMsg.edit({ embeds: [embed] });
  }
}

function buildManualDivisionRow() {
  const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId('assign_div1').setLabel('1st Div (30M+)').setStyle(ButtonStyle.Success),
    new ButtonBuilder().setCustomId('assign_div2').setLabel('2nd Div (20M+)').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('assign_div3').setLabel('3rd Div (10M+)').setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId('assign_div4').setLabel('4th Div (5M+)').setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId('assign_div5').setLabel('5th Div (0-5M)').setStyle(ButtonStyle.Secondary),
  );
}

async function assignDivisionRole(member, division, channel) {
  const guild = member.guild;
  const divisionRoleConfig = BOUNTY_ROLES.find(r => r.name === division);

  let role = guild.roles.cache.find(r => r.name === division);
  if (!role && divisionRoleConfig) {
    try {
      role = await guild.roles.create({
        name: division,
        color: divisionRoleConfig.color,
        reason: 'Auto-created Division role',
      });
    } catch (err) {
      console.error('Could not create role:', err.message);
    }
  }

  if (role) {
    try {
      await member.roles.add(role);
    } catch (err) {
      console.error('Could not assign role:', err.message);
      await channel.send({ content: `⚠️ Could not assign the ${division} role. Please contact an admin.` });
    }
  }
}
