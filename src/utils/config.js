module.exports = {
  CREW_NAME: process.env.CREW_NAME || 'The Crew',
  CREW_COLOR: 0xFF4500,
  TICKET_CATEGORY_NAME: 'TICKETS',
  JOIN_CREW_CHANNEL: 'join-crew',
  LOG_CHANNEL: 'ticket-logs',

  BOUNTY_ROLES: [
    { name: 'Division 1', min: 3_000_000_000, color: 0xFFD700 },
    { name: 'Division 2', min: 1_000_000_000, color: 0xC0C0C0 },
    { name: 'Division 3', min: 500_000_000,   color: 0xCD7F32 },
    { name: 'Division 4', min: 100_000_000,   color: 0x4169E1 },
    { name: 'Division 5', min: 0,             color: 0x228B22 },
  ],

  USERNAME_REGEX: /^[a-zA-Z0-9_]{3,32}$/,

  BOUNTY_NUMBER_REGEX: /^\d[\d,\.]*\s*(B|M|K|billion|million|thousand)?\s*$/i,

  BOUNTY_THRESHOLDS: {
    'Division 1': 3_000_000_000,
    'Division 2': 1_000_000_000,
    'Division 3': 500_000_000,
    'Division 4': 100_000_000,
    'Division 5': 0,
  },
};
