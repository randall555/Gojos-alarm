module.exports = {
  CREW_NAME: process.env.CREW_NAME || 'The Crew',
  CREW_COLOR: 0xFF0000,
  TICKET_CATEGORY_NAME: 'TICKETS',
  JOIN_CREW_CHANNEL: 'join-crew',
  LOG_CHANNEL: 'ticket-logs',

  BOUNTY_ROLES: [
    { name: '1st Division', min: 30_000_000,  color: 0xFFD700 },
    { name: '2nd Division', min: 20_000_000,  color: 0xC0C0C0 },
    { name: '3rd Division', min: 10_000_000,  color: 0xCD7F32 },
    { name: '4th Division', min: 5_000_000,   color: 0x4169E1 },
    { name: '5th Division', min: 0,            color: 0x228B22 },
  ],

  BOUNTY_THRESHOLDS: {
    '1st Division': 30_000_000,
    '2nd Division': 20_000_000,
    '3rd Division': 10_000_000,
    '4th Division': 5_000_000,
    '5th Division': 0,
  },
};
