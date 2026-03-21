const {
  createTicket,
  closeTicket,
} = require('../utils/ticketManager');
const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');
const { BOUNTY_ROLES, CREW_COLOR } = require('../utils/config');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);
      if (!command) return;

      try {
        await command.execute(interaction, client);
      } catch (err) {
        console.error(err);
        const msg = { content: '❌ An error occurred.', ephemeral: true };
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp(msg);
        } else {
          await interaction.reply(msg);
        }
      }
      return;
    }

    if (interaction.isButton()) {
      const { customId, guild, member, channel } = interaction;

      if (customId === 'join_crew') {
        await interaction.deferReply({ ephemeral: true });
        const { channel: ticketChannel, isNew } = await createTicket(guild, member);

        const embed = new EmbedBuilder()
          .setDescription(
            isNew
              ? `✅ Your ticket has been created! Click the button to go there instantly.`
              : `ℹ️ You already have an open ticket. Click below to go to it.`
          )
          .setColor(isNew ? 0x00ff00 : 0xffaa00);

        const row = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setLabel('📩 Go to My Ticket')
            .setStyle(ButtonStyle.Link)
            .setURL(`https://discord.com/channels/${guild.id}/${ticketChannel.id}`),
        );

        await interaction.editReply({ embeds: [embed], components: [row] });
        return;
      }

      if (customId === 'close_ticket') {
        if (!channel.name.startsWith('ticket-')) {
          return interaction.reply({ content: '❌ This is not a ticket channel.', ephemeral: true });
        }

        await interaction.reply({ content: '🔒 Closing ticket in 5 seconds...' });
        await closeTicket(channel, member.toString());
        return;
      }

      const divButtonMap = {
        assign_div1: 'Division 1',
        assign_div2: 'Division 2',
        assign_div3: 'Division 3',
        assign_div4: 'Division 4',
        assign_div5: 'Division 5',
      };

      if (divButtonMap[customId]) {
        if (!member.permissions.has('ManageRoles')) {
          return interaction.reply({ content: '❌ Only staff can assign divisions.', ephemeral: true });
        }

        await interaction.deferUpdate();

        const divName = divButtonMap[customId];
        const divConfig = BOUNTY_ROLES.find(r => r.name === divName);

        const topicMatch = channel.topic?.match(/User ID: (\d+)/);
        if (!topicMatch) {
          return interaction.followUp({ content: '❌ Could not find the ticket member.', ephemeral: true });
        }

        const targetMember = await guild.members.fetch(topicMatch[1]).catch(() => null);
        if (!targetMember) {
          return interaction.followUp({ content: '❌ Could not find the member.', ephemeral: true });
        }

        let role = guild.roles.cache.find(r => r.name === divName);
        if (!role && divConfig) {
          role = await guild.roles.create({
            name: divName,
            color: divConfig.color,
            reason: 'Division role auto-create',
          });
        }

        if (role) {
          const allDivRoles = BOUNTY_ROLES
            .map(r => guild.roles.cache.find(gr => gr.name === r.name))
            .filter(Boolean);
          await targetMember.roles.remove(allDivRoles).catch(() => {});
          await targetMember.roles.add(role).catch(err => {
            console.error('Role assign error:', err);
          });
        }

        const embed = new EmbedBuilder()
          .setTitle('✅ Division Assigned Manually')
          .setDescription(`${targetMember} has been assigned **${divName}** by ${member}.`)
          .setColor(CREW_COLOR)
          .setTimestamp();

        await channel.send({ embeds: [embed] });
        return;
      }
    }
  },
};
