const { parseBountyFromText, getDivisionForBounty } = require('./bountyParser');

async function extractBountyFromScreenshot(attachment) {
  try {
    const text = await ocrImage(attachment.url);
    if (!text) return null;

    const lines = text.split('\n');
    for (const line of lines) {
      const cleaned = line.replace(/[^\d.,BMKbmk\s]/g, '').trim();
      const bounty = parseBountyFromText(cleaned);
      if (bounty && bounty > 0) {
        return { bounty, division: getDivisionForBounty(bounty) };
      }
    }

    const full = parseBountyFromText(text.replace(/[^\d.,BMKbmk\s]/g, ' '));
    if (full && full > 0) {
      return { bounty: full, division: getDivisionForBounty(full) };
    }

    return null;
  } catch (err) {
    console.error('OCR error:', err);
    return null;
  }
}

async function ocrImage(imageUrl) {
  try {
    const vision = require('@google-cloud/vision');
    const client = new vision.ImageAnnotatorClient();
    const [result] = await client.textDetection(imageUrl);
    const detections = result.textAnnotations;
    if (detections && detections.length > 0) {
      return detections[0].description;
    }
    return null;
  } catch (err) {
    return null;
  }
}

function isLikelyBountyScreenshot(attachment) {
  if (!attachment) return false;
  const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'];
  return imageTypes.includes(attachment.contentType);
}

module.exports = { extractBountyFromScreenshot, isLikelyBountyScreenshot };
