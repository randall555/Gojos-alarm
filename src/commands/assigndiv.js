const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { BOUNTY_ROLES } = require('../utils/config');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('assigndiv')
    .setDescription('Manually assign a Division role to a member')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles)
    .addUserOption(opt =>
      opt.setName('member')
        .setDescription('The member to assign a division to')
        .setRequired(true)
    )
    .addStringOption(opt =>
      opt.setName('division')
        .setDescription('Which division to assign')
        .setRequired(true)
        .addChoices(
          { name: 'Division 1 (3B+)', value: 'Division 1' },
          { name: 'Division 2 (1B+)', value: 'Division 2' },
          { name: 'Division 3 (500M+)', value: 'Division 3' },
          { name: 'Division 4 (100M+)', value: 'Division 4' },
          { name: 'Division 5 (<100M)', value: 'Division 5' },
        )
    ),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    const member = interaction.options.getMember('member');
    const divName = interaction.options.getString('division');
    const guild = interaction.guild;

    const divConfig = BOUNTY_ROLES.find(r => r.name === divName);
    let role = guild.roles.cache.find(r => r.name === divName);

    if (!role && divConfig) {
      role = await guild.roles.create({
        name: divName,
        color: divConfig.color,
        reason: 'Division role creation via /assigndiv',
      });
    }

    if (!role) {
      return interaction.editReply({ content: `❌ Could not find or create the ${divName} role.` });
    }

    try {
      const allDivRoles = BOUNTY_ROLES.map(r => guild.roles.cache.find(gr => gr.name === r.name)).filter(Boolean);
      await member.roles.remove(allDivRoles);

      await member.roles.add(role);
      await interaction.editReply({ content: `✅ Assigned **${divName}** to ${member}.` });
    } catch (err) {
      console.error(err);
      await interaction.editReply({ content: `❌ Failed to assign role: ${err.message}` });
    }
  },
};
