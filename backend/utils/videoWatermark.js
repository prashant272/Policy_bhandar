const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const ffmpegPath = require('ffmpeg-static');
const { execFile, spawn } = require('child_process');

/**
 * Watermarks a video file on the backend by overlaying an SVG-generated PNG banner.
 * @param {string} videoUrlOrPath - URL or local file path of the source video.
 * @param {object} agent - The agent details (name, agentType, mobile, company, email).
 * @param {string} outputPath - The destination file path for the watermarked video.
 * @param {string} resolution - Selected quality resolution ('1080', '720', '480').
 * @param {object} template - Optional template configuration from database.
 * @param {function} onProgress - Optional callback to report processing percentage.
 */
const watermarkVideo = async (videoUrlOrPath, agent, outputPath, resolution, template, onProgress) => {
  let videoPath = videoUrlOrPath;
  let isTempVideo = false;
  
  // Create uploads folder if not exists
  const uploadDir = path.join(__dirname, '../uploads');
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

  // 1. Remote video URL vs Local path resolution
  if (!videoUrlOrPath.startsWith('http')) {
    videoPath = path.join(__dirname, '../..', videoUrlOrPath);
  }

  // 2. Detect video dimensions and duration using ffmpeg
  const metadata = await new Promise((resolve) => {
    const args = ['-i', videoPath];
    execFile(ffmpegPath, args, (err, stdout, stderr) => {
      const match = stderr.match(/Video: .*, (\d+)x(\d+)/);
      const durationMatch = stderr.match(/Duration: (\d{2}):(\d{2}):(\d{2})\.(\d{2})/);
      let durationSeconds = 0;
      if (durationMatch) {
        durationSeconds = parseInt(durationMatch[1]) * 3600 +
                          parseInt(durationMatch[2]) * 60 +
                          parseInt(durationMatch[3]) +
                          parseInt(durationMatch[4]) / 100;
      }
      if (match) {
        resolve({
          width: parseInt(match[1]),
          height: parseInt(match[2]),
          duration: durationSeconds
        });
      } else {
        resolve({ width: 1080, height: 1920, duration: 15 }); // Fallback
      }
    });
  });

  // Calculate dynamic dimensions for the video and ensure they are even numbers
  let videoWidth = Math.round(metadata.width / 2) * 2;
  let videoHeight = Math.round(metadata.height / 2) * 2;

  // Scale dimensions if resolution is provided
  if (resolution && ['1080', '720', '480'].includes(resolution.toString())) {
    const resVal = parseInt(resolution);
    if (metadata.width >= metadata.height) {
      // Landscape video: scale based on height
      videoHeight = resVal;
      videoWidth = Math.round(metadata.width * (resVal / metadata.height));
      videoWidth = Math.round(videoWidth / 2) * 2; // ensure even number
    } else {
      // Portrait video: scale based on width
      videoWidth = resVal;
      videoHeight = Math.round(metadata.height * (resVal / metadata.width));
      videoHeight = Math.round(videoHeight / 2) * 2; // ensure even number
    }
  }

  // Define default template configuration
  const config = template || {
    layoutType: 'bottom-bar',
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    textColor: '#ffffff',
    accentColor: '#f97316',
    borderColor: 'rgba(99, 102, 241, 0.3)',
    showUserPhoto: true,
    showUserName: true,
    showUserDetails: true,
    showUserMobile: true,
    sizeScale: 100,
    imageScale: 100,
    appendMode: false
  };

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

  // Convert profile photo to base64 if it exists
  let profilePhotoBase64 = '';
  if (agent.profilePhoto) {
    try {
      let photoPath = agent.profilePhoto.startsWith('/uploads')
        ? path.join(__dirname, '../..', agent.profilePhoto)
        : agent.profilePhoto;
      
      if (fs.existsSync(photoPath)) {
        const photoBuffer = fs.readFileSync(photoPath);
        const mimeType = agent.profilePhoto.endsWith('.png') ? 'image/png' : 'image/jpeg';
        profilePhotoBase64 = `data:${mimeType};base64,${photoBuffer.toString('base64')}`;
      }
    } catch (photoErr) {
      console.error('Failed to read profile photo for watermark:', photoErr);
    }
  }

  // Convert logo to base64 if it exists
  let logoBase64 = '';
  if (config.logoUrl) {
    try {
      let logoPath = config.logoUrl.startsWith('/uploads')
        ? path.join(__dirname, '../..', config.logoUrl)
        : config.logoUrl;
      
      if (fs.existsSync(logoPath)) {
        const logoBuffer = fs.readFileSync(logoPath);
        const mimeType = config.logoUrl.endsWith('.png') ? 'image/png' : 'image/jpeg';
        logoBase64 = `data:${mimeType};base64,${logoBuffer.toString('base64')}`;
      }
    } catch (logoErr) {
      console.error('Failed to read logo for watermark:', logoErr);
    }
  }

  const sizeScale = (config.sizeScale || 100) / 100;
  const imgScale = (config.imageScale || 100) / 100;

  // Dynamic layout calculations (matches the image watermark sizes perfectly)
  const isProf = config.layoutType === 'professional-bottom';
  const margin = Math.round(videoHeight * 0.04);
  
  let cardHeight;
  if (isProf) {
    cardHeight = Math.max(120, Math.round(videoHeight * 0.16 * sizeScale));
  } else {
    cardHeight = Math.max(90, Math.round(videoHeight * 0.11 * sizeScale));
  }
  // Ensure even cardHeight to prevent ffmpeg canvas sizing issues in append mode
  cardHeight = Math.round(cardHeight / 2) * 2;

  let cardWidth, cardX, cardY;
  if (isProf) {
    cardWidth = videoWidth;
    cardX = 0;
    cardY = config.appendMode ? videoHeight : (videoHeight - cardHeight);
  } else if (config.layoutType.includes('bar')) {
    cardWidth = Math.round(videoWidth * 0.92);
    cardX = Math.round((videoWidth - cardWidth) / 2);
    if (config.layoutType === 'top-bar') {
      cardY = margin;
    } else {
      cardY = config.appendMode ? videoHeight : (videoHeight - cardHeight - margin);
    }
  } else {
    // box layout
    cardWidth = Math.round(videoWidth * 0.55 * sizeScale); // 55% width for video boxes
    if (config.layoutType.includes('right')) {
      cardX = videoWidth - cardWidth - margin;
    } else {
      cardX = margin;
    }
    if (config.layoutType.includes('top')) {
      cardY = margin;
    } else {
      cardY = config.appendMode ? videoHeight : (videoHeight - cardHeight - margin);
    }
  }

  const paddingX = Math.round(cardWidth * 0.04);
  const centerY = cardY + cardHeight / 2;
  let currentX = cardX + paddingX;

  // Render elements in SVG
  let logoElement = '';
  let photoElement = '';

  if (isProf) {
    const boxSize = Math.round(cardHeight * 0.75 * imgScale);
    const boxX = currentX;
    const boxY = centerY - boxSize / 2;
    
    // Draw white background square box with accent border
    photoElement = `
      <rect x="${boxX}" y="${boxY}" width="${boxSize}" height="${boxSize}" rx="${Math.round(boxSize * 0.12)}" ry="${Math.round(boxSize * 0.12)}" fill="#ffffff" stroke="${config.accentColor || '#f97316'}" stroke-width="${Math.max(2, Math.round(videoHeight * 0.003))}" />
    `;
    
    if (logoBase64) {
      const imgSize = boxSize * 0.9;
      const offset = (boxSize - imgSize) / 2;
      photoElement += `
        <image x="${boxX + offset}" y="${boxY + offset}" width="${imgSize}" height="${imgSize}" href="${logoBase64}" preserveAspectRatio="xMidYMid contain" />
      `;
    } else if (config.showUserPhoto && profilePhotoBase64) {
      const imgSize = boxSize * 0.9;
      const offset = (boxSize - imgSize) / 2;
      photoElement += `
        <image x="${boxX + offset}" y="${boxY + offset}" width="${imgSize}" height="${imgSize}" href="${profilePhotoBase64}" preserveAspectRatio="xMidYMid slice" />
      `;
    } else {
      const initial = name ? name.charAt(0).toUpperCase() : 'P';
      photoElement += `
        <text x="${boxX + boxSize / 2}" y="${boxY + boxSize / 2}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(boxSize * 0.35)}" font-weight="bold" fill="${config.textColor || '#000000'}" text-anchor="middle" dominant-baseline="central">${initial}</text>
      `;
    }
    currentX += boxSize + Math.round(cardWidth * 0.03);
  } else {
    // Normal layouts (bar or box) rendering
    if (logoBase64) {
      const logoHeight = Math.round(cardHeight * 0.6);
      const logoWidth = logoHeight; // approximate square or rectangular aspect
      logoElement = `<image x="${currentX}" y="${centerY - logoHeight / 2}" width="${logoWidth}" height="${logoHeight}" href="${logoBase64}" preserveAspectRatio="xMidYMid contain" />`;
      currentX += logoWidth + Math.round(cardWidth * 0.025);
    }

    if (config.showUserPhoto) {
      const photoRadius = Math.round(cardHeight * 0.32 * imgScale);
      const photoDiameter = photoRadius * 2;
      const photoX = currentX + photoRadius;
      const photoY = centerY;
      
      if (profilePhotoBase64) {
        photoElement = `
          <defs>
            <clipPath id="circleClip">
              <circle cx="${photoX}" cy="${photoY}" r="${photoRadius}" />
            </clipPath>
          </defs>
          <circle cx="${photoX}" cy="${photoY}" r="${photoRadius + 2}" fill="${config.accentColor || '#f97316'}" />
          <image x="${photoX - photoRadius}" y="${photoY - photoRadius}" width="${photoDiameter}" height="${photoDiameter}" href="${profilePhotoBase64}" clip-path="url(#circleClip)" preserveAspectRatio="xMidYMid slice" />
        `;
      } else {
        const initial = name ? name.charAt(0).toUpperCase() : 'P';
        photoElement = `
          <circle cx="${photoX}" cy="${photoY}" r="${photoRadius}" fill="#1e293b" stroke="${config.accentColor || '#f97316'}" stroke-width="2" />
          <text x="${photoX}" y="${photoY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(photoRadius * 1.1)}" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="central">${initial}</text>
        `;
      }
      currentX += photoDiameter + Math.round(cardWidth * 0.025);
    }
  }

  const nameFontSize = Math.round(cardHeight * 0.20);
  const detailFontSize = Math.round(cardHeight * 0.12);
  const nameY = centerY - Math.round(cardHeight * 0.13);
  const detailsY = centerY + Math.round(cardHeight * 0.15);

  const isBox = !config.layoutType.includes('bar') && !isProf;

  let textElements = '';
  let contactElements = '';

  if (isProf) {
    const boxSize = Math.round(cardHeight * 0.75);
    const boxY = centerY - boxSize / 2;
    let startY = boxY;
    const boxLineHeight = Math.round(cardHeight * 0.11);
    
    textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(cardHeight * 0.09)}" font-weight="500" fill="${config.textColor || '#ffffff'}" filter="url(#shadow)" dominant-baseline="middle">With Best Regards,</text>`;
    startY += boxLineHeight * 1.1;

    if (config.showUserName) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(cardHeight * 0.15)}" font-weight="bold" fill="${config.textColor || '#ffffff'}" filter="url(#shadow)" dominant-baseline="middle">${name.toUpperCase()}</text>`;
      startY += boxLineHeight * 1.3;
    }
    if (config.showUserDetails) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(cardHeight * 0.095)}" font-weight="500" fill="${config.textColor || '#ffffff'}" opacity="0.9" filter="url(#shadow)" dominant-baseline="middle">${agentType}</text>`;
      startY += boxLineHeight;
    }
    if (config.showUserMobile) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(cardHeight * 0.095)}" font-weight="bold" fill="${config.accentColor || '#f97316'}" filter="url(#shadow)" dominant-baseline="middle">Mob: +91 ${mobile}</text>`;
      startY += boxLineHeight;
    }
    textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(cardHeight * 0.095)}" font-weight="500" fill="${config.textColor || '#ffffff'}" opacity="0.8" filter="url(#shadow)" dominant-baseline="middle">${email}</text>`;
    startY += boxLineHeight;

    if (config.showUserDetails) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${Math.round(cardHeight * 0.095)}" font-weight="500" fill="${config.textColor || '#ffffff'}" opacity="0.8" filter="url(#shadow)" dominant-baseline="middle">${company}</text>`;
    }
  } else if (isBox) {
    const boxLineHeight = Math.round(cardHeight * 0.18);
    let startY = centerY - Math.round(cardHeight * 0.25);
    
    if (config.showUserName) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="${config.textColor || '#ffffff'}" filter="url(#shadow)" dominant-baseline="middle">${name}</text>`;
      startY += boxLineHeight * 1.2;
    }
    if (config.showUserDetails) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${detailFontSize}" font-weight="600" fill="${config.textColor || '#ffffff'}" opacity="0.9" filter="url(#shadow)" dominant-baseline="middle">${agentType} | ${company}</text>`;
      startY += boxLineHeight;
    }
    if (config.showUserMobile) {
      textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${detailFontSize}" font-weight="bold" fill="${config.accentColor || '#f97316'}" filter="url(#shadow)" dominant-baseline="middle">Mob: +91 ${mobile}</text>`;
      startY += boxLineHeight;
    }
    textElements += `<text x="${currentX}" y="${startY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${detailFontSize}" font-weight="500" fill="${config.textColor || '#ffffff'}" opacity="0.8" filter="url(#shadow)" dominant-baseline="middle">${email}</text>`;
  } else {
    // Bar layouts
    if (config.showUserName) {
      textElements += `<text x="${currentX}" y="${nameY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="${config.textColor || '#ffffff'}" filter="url(#shadow)" dominant-baseline="middle">${name}</text>`;
    }
    if (config.showUserDetails) {
      textElements += `<text x="${currentX}" y="${detailsY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${detailFontSize}" font-weight="600" fill="${config.textColor || '#ffffff'}" opacity="0.9" filter="url(#shadow)" dominant-baseline="middle">${agentType} | ${company}</text>`;
    }

    if (config.showUserMobile) {
      contactElements += `
        <text x="${cardX + cardWidth - paddingX}" y="${nameY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${nameFontSize}" font-weight="bold" fill="${config.accentColor || '#f97316'}" filter="url(#shadow)" text-anchor="end" dominant-baseline="middle">Mob: +91 ${mobile}</text>
        <text x="${cardX + cardWidth - paddingX}" y="${detailsY}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${detailFontSize}" font-weight="600" fill="${config.textColor || '#ffffff'}" opacity="0.9" filter="url(#shadow)" text-anchor="end" dominant-baseline="middle">${email}</text>
      `;
    }
  }

  const svgHeight = config.appendMode ? (videoHeight + cardHeight) : videoHeight;

  // Background card SVG string
  const svg = `
    <svg width="${videoWidth}" height="${svgHeight}" viewBox="0 0 ${videoWidth} ${svgHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="1" dy="1" stdDeviation="2" flood-color="#000000" flood-opacity="0.9"/>
        </filter>
      </defs>

      <!-- Watermark Container Card -->
      <rect x="${cardX}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="${isProf ? 0 : Math.round(cardHeight * 0.12)}" ry="${isProf ? 0 : Math.round(cardHeight * 0.12)}" fill="${config.backgroundColor || 'rgba(15, 23, 42, 0.8)'}" stroke="${config.borderColor || 'rgba(99, 102, 241, 0.3)'}" stroke-width="${Math.max(1.5, Math.round(videoHeight * 0.002))}" />
      
      <!-- Accent Top Border for Professional Layout -->
      ${isProf ? `<line x1="${cardX}" y1="${cardY}" x2="${cardX + cardWidth}" y2="${cardY}" stroke="${config.accentColor || '#f97316'}" stroke-width="${Math.max(3, Math.round(videoHeight * 0.004))}" />` : ''}

      <!-- Logo & Avatar -->
      ${logoElement}
      ${photoElement}

      <!-- Details Texts -->
      ${textElements}
      ${contactElements}
    </svg>
  `;

  const watermarkPngPath = path.join(uploadDir, `temp-wm-${Date.now()}-${Math.round(Math.random() * 1e9)}.png`);
  await sharp(Buffer.from(svg))
    .png()
    .toFile(watermarkPngPath);

  // 3. Execute ffmpeg process using spawn to track progress
  return new Promise((resolve, reject) => {
    // Overlay the responsive full-screen watermark SVG directly
    const filterComplexValue = resolution && ['1080', '720', '480'].includes(resolution.toString())
      ? (config.appendMode
          ? `[0:v]scale=${videoWidth}:${videoHeight},pad=${videoWidth}:${videoHeight + cardHeight}:0:0:black[padded];[padded][1:v]overlay=x=0:y=0`
          : `[0:v]scale=${videoWidth}:${videoHeight}[scaled];[scaled][1:v]overlay=x=0:y=0`)
      : (config.appendMode
          ? `[0:v]pad=iw:ih+${cardHeight}:0:0:black[padded];[padded][1:v]overlay=x=0:y=0`
          : '[0:v][1:v]overlay=x=0:y=0');

    const args = [
      '-y',
      '-i', videoPath,
      '-i', watermarkPngPath,
      '-filter_complex', filterComplexValue,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-c:a', 'copy',
      outputPath
    ];

    const child = spawn(ffmpegPath, args);
    let stderrAccumulator = '';

    child.stderr.on('data', (data) => {
      const chunk = data.toString();
      stderrAccumulator += chunk;
      
      // Parse progress time: time=00:00:05.12
      const timeMatches = chunk.match(/time=(\d{2}):(\d{2}):(\d{2})\.(\d{2})/g);
      if (timeMatches && timeMatches.length > 0 && metadata.duration > 0 && onProgress) {
        const lastMatch = timeMatches[timeMatches.length - 1];
        const parts = lastMatch.replace('time=', '').split(':');
        const secParts = parts[2].split('.');
        const seconds = parseInt(parts[0]) * 3600 +
                        parseInt(parts[1]) * 60 +
                        parseInt(secParts[0]) +
                        parseInt(secParts[1] || 0) / 100;
        
        const percent = Math.min(99, Math.round((seconds / metadata.duration) * 100));
        onProgress(percent);
      }
    });

    child.on('close', (code) => {
      // Clean up temporary watermark PNG
      try { fs.unlinkSync(watermarkPngPath); } catch (_) {}
      
      // Clean up downloaded temporary raw video if applicable
      if (isTempVideo) {
        try { fs.unlinkSync(videoPath); } catch (_) {}
      }

      if (code === 0) {
        if (onProgress) onProgress(100);
        resolve(outputPath);
      } else {
        console.error('ffmpeg execution failed:', stderrAccumulator);
        reject(new Error(`ffmpeg execution failed with code ${code}`));
      }
    });
  });
};

module.exports = { watermarkVideo };
