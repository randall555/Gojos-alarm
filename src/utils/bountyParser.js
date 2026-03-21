function parseBountyFromText(text) {
  const cleaned = text.replace(/,/g, '').trim();

  const patterns = [
    { regex: /(\d+(?:\.\d+)?)\s*B(?:illion)?/i, mult: 1_000_000_000 },
    { regex: /(\d+(?:\.\d+)?)\s*M(?:illion)?/i, mult: 1_000_000 },
    { regex: /(\d+(?:\.\d+)?)\s*K/i,              mult: 1_000 },
    { regex: /^(\d{6,})$/,                          mult: 1 },
  ];

  for (const { regex, mult } of patterns) {
    const match = cleaned.match(regex);
    if (match) return Math.round(parseFloat(match[1]) * mult);
  }

  return null;
}

function getDivisionForBounty(bounty) {
  if (bounty >= 30_000_000) return '1st Division';
  if (bounty >= 20_000_000) return '2nd Division';
  if (bounty >= 10_000_000) return '3rd Division';
  if (bounty >= 5_000_000)  return '4th Division';
  return '5th Division';
}

function formatBounty(amount) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

module.exports = { parseBountyFromText, getDivisionForBounty, formatBounty };
