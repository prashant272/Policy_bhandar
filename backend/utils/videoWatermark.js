const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const { execFile } = require('child_process');

/**
 * Watermarks a video file on the backend by overlaying an SVG-generated PNG banner.
 * @param {string} videoUrlOrPath - URL or local file path of the source video.
 * @param {object} agent - The agent details (name, agentType, mobile, company, email).
 * @param {string} outputPath - The destination file path for the watermarked video.
 */
const watermarkVideo = async (videoUrlOrPath, agent, outputPath) => {
  let videoPath = videoUrlOrPath;
  let isTempVideo = false;
  
  // Create uploads folder if not exists
  const uploadDir = path.join(__dirname, '../../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // Self-cleaning: remove old watermarked temp videos (> 15 minutes old)
  try {
    const files = fs.readdirSync(uploadDir);
    const now = Date.now();
    for (const file of files) {
      if (file.startsWith('watermarked-') && file.endsWith('.mp4')) {
        const filePath = path.join(uploadDir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > 15 * 60 * 1000) { // 15 mins
          fs.unlinkSync(filePath);
        }
      }
    }
  } catch (e) {
    console.error('Error cleaning up old watermarked files:', e);
  }

  // 1. Download remote video if needed
  if (videoUrlOrPath.startsWith('http')) {
    const axios = require('axios');
    const tempVideoPath = path.join(uploadDir, `temp-video-${Date.now()}-${Math.round(Math.random() * 1e9)}.mp4`);
    const writer = fs.createWriteStream(tempVideoPath);
    
    const response = await axios({
      url: videoUrlOrPath,
      method: 'GET',
      responseType: 'stream'
    });
    
    response.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    videoPath = tempVideoPath;
    isTempVideo = true;
  } else {
    // Local path resolution
    videoPath = path.join(__dirname, '../..', videoUrlOrPath);
  }

  // 2. Generate Watermark PNG Overlay via SVG and sharp
  const width = 1080;
  const height = 140;

  const escapeXml = (unsafe) => {
    if (!unsafe) return '';
    return unsafe.toString().replace(/[<>&'"]/g, (c) => {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
      }
    });
  };

  const name = escapeXml(agent.name || '');
  const agentType = escapeXml(agent.agentType || 'Advisor');
  const company = escapeXml(agent.company || 'Policybhandar');
  const mobile = escapeXml(agent.mobile || '');
  const email = escapeXml(agent.email || '');

  const svg = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
      <!-- Dark footer banner -->
      <rect x="0" y="0" width="${width}" height="${height}" fill="#0b1021" fill-opacity="0.85" />
      
      <!-- Top Accent Line -->
      <rect x="0" y="0" width="${width}" height="6" fill="#a855f7" />
      
      <!-- Left side: Name & Agency details -->
      <text x="40" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="30" font-weight="bold" fill="#ffffff">${name}</text>
      <text x="40" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" fill="#94a3b8">${agentType} | ${company}</text>
      
      <!-- Right side: Contact Details -->
      <text x="${width - 40}" y="65" font-family="'Plus Jakarta Sans', sans-serif" font-size="30" font-weight="bold" fill="#a855f7" text-anchor="end">Mob: +91 ${mobile}</text>
      <text x="${width - 40}" y="105" font-family="'Plus Jakarta Sans', sans-serif" font-size="20" fill="#94a3b8" text-anchor="end">${email}</text>
    </svg>
  `;

  const watermarkPngPath = path.join(uploadDir, `temp-wm-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(watermarkPngPath);

  // 3. Execute ffmpeg process
  return new Promise((resolve, reject) => {
    // scale watermark to match video width dynamically and overlay at the bottom
    const args = [
      '-y',
      '-i', videoPath,
      '-i', watermarkPngPath,
      '-filter_complex', '[1:v]scale=w=main_w:h=-1[wm];[0:v][wm]overlay=x=0:y=main_h-overlay_h',
      '-c:a', 'copy',
      outputPath
    ];

    execFile(ffmpegPath, args, (err, stdout, stderr) => {
      // Clean up temporary watermark PNG
      try { fs.unlinkSync(watermarkPngPath); } catch (_) {}
      
      // Clean up downloaded temporary raw video if applicable
      if (isTempVideo) {
        try { fs.unlinkSync(videoPath); } catch (_) {}
      }

      if (err) {
        console.error('ffmpeg execution failed:', stderr);
        return reject(err);
      }
      resolve(outputPath);
    });
  });
};

module.exports = { watermarkVideo };
