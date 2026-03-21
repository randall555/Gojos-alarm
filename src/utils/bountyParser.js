function parseBountyFromText(text) {
  const cleaned = text.replace(/,/g, '').trim();

  const patterns = [
    /(\d+(?:\.\d+)?)\s*B(?:illion)?/i,
    /(\d+(?:\.\d+)?)\s*M(?:illion)?/i,
    /(\d+(?:\.\d+)?)\s*K(?:thousand)?/i,
    /^(\d{7,})$/,
  ];

  for (const pattern of patterns) {
    const match = cleaned.match(pattern);
    if (match) {
      const num = parseFloat(match[1]);
      if (pattern.source.includes('B')) return Math.round(num * 1_000_000_000);
      if (pattern.source.includes('M')) return Math.round(num * 1_000_000);
      if (pattern.source.includes('K')) return Math.round(num * 1_000);
      return parseInt(match[1]);
    }
  }

  return null;
}

function getDivisionForBounty(bounty) {
  if (bounty >= 3_000_000_000) return 'Division 1';
  if (bounty >= 1_000_000_000) return 'Division 2';
  if (bounty >= 500_000_000)   return 'Division 3';
  if (bounty >= 100_000_000)   return 'Division 4';
  return 'Division 5';
}

function formatBounty(amount) {
  if (amount >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000)     return `${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000)         return `${(amount / 1_000).toFixed(1)}K`;
  return amount.toString();
}

module.exports = { parseBountyFromText, getDivisionForBounty, formatBounty };
