/**
 * Dynamically overlays agent details onto an image banner using HTML5 Canvas.
 * @param {string} imageUrl - The source URL of the image banner.
 * @param {object} agent - The agent data { name, mobile, company, agentType, profilePhoto }.
 * @param {object} template - Optional template configuration from admin.
 * @param {string} watermarkType - 'digicard', 'whatsapp', or 'link'.
 * @returns {Promise<string>} - Resolves to a data URL of the watermarked image.
 */
export const watermarkImage = (imageUrl, agent, template = null, watermarkType = 'digicard') => {
  return new Promise((resolve, reject) => {
    const processImage = async () => {
      try {
        // Default template config if none provided
        let config = template || {
          layoutType: 'bottom-bar',
          backgroundColor: 'rgba(7, 10, 19, 0.78)',
          textColor: '#ffffff',
          accentColor: '#a855f7',
          borderColor: 'rgba(99, 102, 241, 0.45)',
          logoUrl: null,
          showUserPhoto: true,
          showUserName: true,
          showUserDetails: true,
          showUserMobile: true,
          sizeScale: 100,
          imageScale: 100,
          showSocialIcons: true
        };

        if (watermarkType === 'whatsapp' || watermarkType === 'link') {
          config = {
            ...config,
            layoutType: watermarkType === 'whatsapp' ? 'qr-append-bottom' : 'link-append-bottom',
            appendMode: true,
            backgroundColor: '#ffffff',
            textColor: '#0f172a',
            borderColor: '#e2e8f0'
          };
        }

        const scaleMultiplier = (config.sizeScale || 100) / 100;
        const imageScaleMultiplier = (config.imageScale || 100) / 100;



        // 1. Load main image via fetch to bypass Image CORS quirks and get better errors
        const img = await new Promise(async (res, rej) => {
          try {
            const response = await fetch(imageUrl);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            const i = new Image();
            i.onload = () => {
              // URL.revokeObjectURL(objectUrl); // Optional cleanup
              res(i);
            };
            i.onerror = () => rej(new Error('Failed to decode image from blob'));
            i.src = objectUrl;
          } catch (e) {
            rej(new Error('Failed to load main image for watermarking: ' + e.message));
          }
        });

        const apiBaseUrl = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000`;
        const apiBase = `${apiBaseUrl}/api`;

        // Helper to load image via proxy/fetch
        const loadImageSecurely = async (url) => {
          let proxyUrl = url;
          if (url.startsWith('http') && !url.includes(window.location.hostname) && !url.startsWith(apiBaseUrl)) {
            proxyUrl = `${apiBase}/materials/download-proxy?url=${encodeURIComponent(url)}`;
          } else if (url.startsWith('/uploads')) {
            proxyUrl = `${apiBaseUrl}${url}`;
          }

          try {
            const response = await fetch(proxyUrl);
            if (!response.ok) return null;
            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);
            
            return await new Promise((res) => {
              const img = new Image();
              img.onload = () => res(img);
              img.onerror = () => res(null);
              img.src = objectUrl;
            });
          } catch (e) {
            return null;
          }
        };

        // 2. Load agent profile photo (avatar) if configured
        let avatar = null;
        if (config.showUserPhoto && agent.profilePhoto) {
          avatar = await loadImageSecurely(agent.profilePhoto);
        }

        let qrAvatar = null;
        if (watermarkType === 'whatsapp' || watermarkType === 'link') {
          const qrUrl = agent.whatsappScannerImage || agent.profilePhoto;
          if (qrUrl) {
            qrAvatar = await loadImageSecurely(qrUrl);
          }
        }

        // 3. Load custom logo if configured
        let logo = null;
        if (config.logoUrl) {
          logo = await loadImageSecurely(config.logoUrl);
        }

        // 4. Configure Canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const isAppend = config.appendMode && (config.layoutType.includes('bottom') || config.layoutType.includes('append'));

        let cardHeight;
        if (config.layoutType === 'professional-bottom') {
          cardHeight = Math.max(120, Math.round(img.naturalHeight * 0.18)) * scaleMultiplier;
        } else if (config.layoutType === 'qr-append-bottom' || config.layoutType === 'link-append-bottom') {
          // Base height on canvas width (which is img.naturalWidth) so narrow images still get a tall enough card
          let expectedQrHeight = canvas.width * 0.4; 
          if (typeof qrAvatar !== 'undefined' && qrAvatar && qrAvatar.width) {
             // Let the QR code take up to 40% of the canvas width, calculate height based on its aspect ratio
             const qrAspect = qrAvatar.height / qrAvatar.width;
             expectedQrHeight = (canvas.width * 0.4) * qrAspect;
          }
          // The total card needs space for the curve + top text + QR code + bottom text
          const verticalPadding = canvas.width * 0.3; // 30% of width for texts and padding
          cardHeight = Math.round(expectedQrHeight + verticalPadding) * scaleMultiplier;
          // Ensure a minimum height just in case
          cardHeight = Math.max(cardHeight, Math.round(img.naturalHeight * 0.25) * scaleMultiplier);
        } else {
          cardHeight = Math.max(70, Math.round(img.naturalHeight * 0.15)) * scaleMultiplier;
        }

        canvas.width = img.naturalWidth;
        canvas.height = isAppend ? img.naturalHeight + cardHeight : img.naturalHeight;

        // Fill white background for the appended part (non-QR)
        if (isAppend && config.layoutType !== 'qr-append-bottom' && config.layoutType !== 'link-append-bottom') {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Draw original image
        ctx.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

        // Draw curved white background for QR
        if (isAppend && (config.layoutType === 'qr-append-bottom' || config.layoutType === 'link-append-bottom')) {
          const curveHeight = Math.round(canvas.width * 0.16);
          
          ctx.save();
          // Add drop shadow to make the curve pop against any background (even white padding)
          ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
          ctx.shadowBlur = Math.round(canvas.width * 0.015);
          ctx.shadowOffsetY = -Math.round(canvas.width * 0.005);
          
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.moveTo(0, img.naturalHeight);
          // Curve upwards into the image
          ctx.quadraticCurveTo(canvas.width / 2, img.naturalHeight - curveHeight * 2.5, canvas.width, img.naturalHeight);
          ctx.lineTo(canvas.width, canvas.height);
          ctx.lineTo(0, canvas.height);
          ctx.closePath();
          ctx.fill();
          ctx.restore();
        }

        let cardWidth, cardX, cardY;
        const margin = Math.round(img.naturalHeight * 0.04);

        if (config.layoutType === 'professional-bottom' || config.layoutType === 'qr-append-bottom' || config.layoutType === 'link-append-bottom') {
          cardWidth = canvas.width;
          cardX = 0;
          cardY = isAppend ? img.naturalHeight : canvas.height - cardHeight;
        } else if (config.layoutType.includes('bar')) {
          cardWidth = Math.round(canvas.width * 0.92) * scaleMultiplier;
          cardX = Math.round((canvas.width - cardWidth) / 2);
          if (config.layoutType === 'top-bar') {
            cardY = margin;
          } else {
            cardY = isAppend ? img.naturalHeight : canvas.height - cardHeight - margin;
          }
        } else {
          // box layout
          cardWidth = Math.min(Math.round(canvas.width * 0.45), 600) * scaleMultiplier; // 45% width for boxes
          if (config.layoutType.includes('right')) {
            cardX = canvas.width - cardWidth - margin;
          } else {
            cardX = margin;
          }

          if (config.layoutType.includes('top')) {
            cardY = margin;
          } else {
            cardY = isAppend ? img.naturalHeight : canvas.height - cardHeight - margin;
          }
        }

        const isProf = config.layoutType === 'professional-bottom';
        const isQR = config.layoutType === 'qr-append-bottom' || config.layoutType === 'link-append-bottom';
        const radius = (isProf || isQR) ? 0 : Math.round(cardHeight * 0.15);

        // Draw translucent glass card background
        ctx.beginPath();
        if (typeof ctx.roundRect === 'function' && !isProf && !isQR && !isAppend) {
          ctx.roundRect(cardX, cardY, cardWidth, cardHeight, radius);
        } else {
          ctx.rect(cardX, cardY, cardWidth, cardHeight);
        }
        if (config.backgroundColor !== 'transparent') {
          ctx.fillStyle = config.backgroundColor;
          ctx.fill();
        }

        // Draw borders around card
        if (config.backgroundColor !== 'transparent' && !isQR) {
          if (isProf) {
            ctx.beginPath();
            ctx.moveTo(cardX, cardY);
            ctx.lineTo(cardX + cardWidth, cardY);
            ctx.strokeStyle = config.borderColor;
            ctx.lineWidth = Math.max(3, Math.round(img.height * 0.005));
            ctx.stroke();
          } else {
            ctx.strokeStyle = config.borderColor;
            ctx.lineWidth = Math.max(1.5, Math.round(img.naturalHeight * 0.0035));
            ctx.stroke();
          }
        }

        const paddingX = isProf ? Math.round(cardWidth * 0.05) : Math.round(cardWidth * 0.035);
        const centerY = cardY + cardHeight / 2;
        let currentX = cardX + paddingX;

        if (isQR) {
          // Special centered layout for QR/Link matching the reference design
          const centerX = canvas.width / 2;
          
          // Start drawing a bit higher because of the curve we added
          const curveOffset = Math.round(canvas.width * 0.05);
          let currentY = img.naturalHeight - curveOffset; 

          // Top Banner Text
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.font = `bold ${Math.round(cardHeight * 0.08)}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillStyle = '#1e293b'; // Dark slate
          let headerText = 'अधिक जानकारी के लिए QR SCAN करें..';
          
          if (config.layoutType === 'link-append-bottom') {
            headerText = agent.customLink ? agent.customLink : 'For more info, please click the link below or scan..';
          }
          
          ctx.fillText(headerText, centerX, currentY);

          currentY += Math.round(cardHeight * 0.12);

          // We set maxQrWidth to 45% of canvas width to make it wider, and allow maxQrHeight to take most of the card height
          const maxQrWidth = Math.round(canvas.width * 0.45);
          const maxQrHeight = Math.round(cardHeight * 0.70);
          
          let qrWidth = maxQrWidth;
          let qrHeight = maxQrHeight;

          if (qrAvatar) {
             const ratio = Math.min(maxQrWidth / qrAvatar.width, maxQrHeight / qrAvatar.height);
             qrWidth = Math.round(qrAvatar.width * ratio);
             qrHeight = Math.round(qrAvatar.height * ratio);
          }

          const qrX = centerX - qrWidth / 2;
          
          if (qrAvatar) {
             ctx.drawImage(qrAvatar, qrX, currentY, qrWidth, qrHeight);
          } else {
             ctx.fillStyle = '#f1f5f9';
             ctx.fillRect(qrX, currentY, qrWidth, qrHeight);
             ctx.fillStyle = '#94a3b8';
             ctx.font = `${Math.round(qrHeight * 0.2)}px sans-serif`;
             ctx.fillText('NO QR', centerX, currentY + qrHeight / 2);
          }
          
          // Draw full red border around QR
          ctx.strokeStyle = '#dc2626'; // Red 600
          ctx.lineWidth = Math.max(4, Math.round(canvas.width * 0.008));
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          ctx.strokeRect(qrX, currentY, qrWidth, qrHeight);

          currentY += qrHeight + Math.round(cardHeight * 0.12);

          // Name and Phone on same line
          const nameText = (agent.name || '').toUpperCase();
          const phoneText = agent.mobile ? `📞 ${agent.mobile}` : '';
          
          let fontSize = Math.round(cardHeight * 0.08);
          // Scale font size based on canvas width instead of just cardHeight to prevent cut off on narrow images
          const maxFontSize = Math.round(canvas.width * 0.05);
          fontSize = Math.min(fontSize, maxFontSize);
          
          ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
          ctx.textBaseline = 'middle';
          
          if (nameText && phoneText) {
             // Prevent text cut-off on narrow images by scaling down if needed
             const nameWidth = ctx.measureText(nameText).width;
             const phoneWidth = ctx.measureText(phoneText).width;
             const maxSide = Math.max(nameWidth, phoneWidth);
             const availableSide = canvas.width * 0.45; // 45% for each side
             
             if (maxSide > availableSide) {
                fontSize = Math.floor(fontSize * (availableSide / maxSide));
                ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
             }
          
             ctx.fillStyle = '#0f172a';
             ctx.textAlign = 'right';
             ctx.fillText(nameText, centerX - Math.round(canvas.width * 0.03), currentY);
             
             // Divider
             ctx.fillStyle = '#cbd5e1';
             ctx.textAlign = 'center';
             ctx.fillText('|', centerX, currentY - 2);
             
             ctx.fillStyle = '#334155';
             ctx.textAlign = 'left';
             ctx.fillText(phoneText, centerX + Math.round(canvas.width * 0.03), currentY);
          } else if (nameText || phoneText) {
             const textW = ctx.measureText(nameText || phoneText).width;
             if (textW > canvas.width * 0.9) {
                fontSize = Math.floor(fontSize * ((canvas.width * 0.9) / textW));
                ctx.font = `bold ${fontSize}px "Plus Jakarta Sans", sans-serif`;
             }
             
             ctx.textAlign = 'center';
             ctx.fillStyle = nameText ? '#0f172a' : '#334155';
             ctx.fillText(nameText || phoneText, centerX, currentY);
          }
        } else if (isProf) {
          // Professional layout logo/photo box
          const boxSize = Math.round(cardHeight * 0.75) * imageScaleMultiplier;
          const boxX = currentX;
          const boxY = centerY - boxSize / 2;

          ctx.beginPath();
          if (typeof ctx.roundRect === 'function') {
            ctx.roundRect(boxX, boxY, boxSize, boxSize, Math.round(boxSize * 0.15));
          } else {
            ctx.rect(boxX, boxY, boxSize, boxSize);
          }
          ctx.fillStyle = '#ffffff';
          ctx.fill();
          ctx.lineWidth = Math.max(2, Math.round(canvas.height * 0.004));
          ctx.strokeStyle = config.accentColor || '#000000';
          ctx.stroke();

          let activeTextColor = config.textColor;
          if (activeTextColor.toLowerCase() === '#ffffff' || activeTextColor.toLowerCase() === '#fff' || activeTextColor.toLowerCase() === 'white') {
            activeTextColor = '#0f172a'; // Force dark text on white background
          }

          if (logo) {
            const imgSize = boxSize * 0.9;
            const offset = (boxSize - imgSize) / 2;
            ctx.drawImage(logo, boxX + offset, boxY + offset, imgSize, imgSize);
          } else if (config.showUserPhoto && avatar) {
            const imgSize = boxSize * 0.9;
            const offset = (boxSize - imgSize) / 2;
            ctx.drawImage(avatar, boxX + offset, boxY + offset, imgSize, imgSize);
          } else {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.round(boxSize * 0.4)}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle = activeTextColor;
            ctx.fillText(agent.name.charAt(0), boxX + boxSize / 2, boxY + boxSize / 2);
          }

          currentX += boxSize + Math.round(cardWidth * 0.03);

          // Professional Stacked Text
          ctx.textAlign = 'left';
          ctx.textBaseline = 'top';
          let textY = boxY;
          const lineSpacing = Math.round(cardHeight * 0.12);

          ctx.font = `${Math.round(cardHeight * 0.1)}px "Plus Jakarta Sans", sans-serif`;
          ctx.fillStyle = activeTextColor;
          ctx.fillText('With Best Regards,', currentX, textY);
          textY += lineSpacing * 1.2;

          if (config.showUserName) {
            ctx.font = `bold ${Math.round(cardHeight * 0.18)}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillText((agent.name || '').toUpperCase(), currentX, textY);
            textY += lineSpacing * 1.6;
          }

          ctx.font = `500 ${Math.round(cardHeight * 0.11)}px "Plus Jakarta Sans", sans-serif`;
          if (config.showUserDetails) {
            ctx.fillText(agent.agentType || 'Consultant', currentX, textY);
            textY += lineSpacing;
          }
          if (config.showUserMobile) {
            ctx.fillText(agent.mobile || '', currentX, textY);
            textY += lineSpacing;
          }
          ctx.fillText(agent.email || 'user@example.com', currentX, textY);
          textY += lineSpacing;

          if (config.showUserDetails) {
            ctx.fillText(agent.company || 'Policybhandar', currentX, textY);
            textY += lineSpacing;
          }

          if (config.showSocialIcons) {
            const iconRadius = Math.round(cardHeight * 0.08);
            let iconX = currentX + iconRadius;
            const iconY = textY + iconRadius * 0.5;

            // Helper to draw icon
            const drawSocialIcon = (bgColor, letter, x) => {
              ctx.beginPath();
              ctx.arc(x, iconY, iconRadius, 0, Math.PI * 2);
              ctx.fillStyle = bgColor;
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.round(iconRadius * 1.2)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(letter, x, iconY + 1);
            };

            drawSocialIcon('#1877F2', 'f', iconX); // Facebook
            iconX += iconRadius * 2.5;
            drawSocialIcon('#E4405F', 'ig', iconX); // Instagram
            iconX += iconRadius * 2.5;
            drawSocialIcon('#000000', 'X', iconX); // X
            iconX += iconRadius * 2.5;
            drawSocialIcon('#0A66C2', 'in', iconX); // LinkedIn
          }

        } else {
          // Draw Logo
          if (logo) {
            const logoHeight = Math.round(cardHeight * 0.6) * imageScaleMultiplier;
            const logoWidth = logo.naturalWidth * (logoHeight / logo.naturalHeight);
            ctx.drawImage(logo, currentX, centerY - logoHeight / 2, logoWidth, logoHeight);
            currentX += logoWidth + Math.round(cardWidth * 0.025);
          }

          // Draw Avatar
          if (config.showUserPhoto && avatar) {
            const avatarRadius = Math.round(cardHeight * 0.35) * imageScaleMultiplier;
            const avatarX = currentX + avatarRadius;

            ctx.save();
            ctx.beginPath();
            ctx.arc(avatarX, centerY, avatarRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(avatar, avatarX - avatarRadius, centerY - avatarRadius, avatarRadius * 2, avatarRadius * 2);
            ctx.restore();

            ctx.beginPath();
            ctx.arc(avatarX, centerY, avatarRadius, 0, Math.PI * 2);
            ctx.strokeStyle = config.accentColor;
            ctx.lineWidth = Math.max(1, Math.round(canvas.height * 0.002));
            ctx.stroke();

            currentX += avatarRadius * 2 + Math.round(cardWidth * 0.025);
          } else if (config.showUserPhoto && !avatar) {
            // Fallback initials
            const avatarRadius = Math.round(cardHeight * 0.35) * imageScaleMultiplier;
            const avatarX = currentX + avatarRadius;

            ctx.beginPath();
            ctx.arc(avatarX, centerY, avatarRadius, 0, Math.PI * 2);
            ctx.fillStyle = '#1e293b';
            ctx.fill();
            ctx.strokeStyle = config.accentColor;
            ctx.lineWidth = Math.max(1, Math.round(canvas.height * 0.002));
            ctx.stroke();

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold ${Math.round(avatarRadius)}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle = config.textColor;
            ctx.fillText(agent.name.charAt(0), avatarX, centerY);

            currentX += avatarRadius * 2 + Math.round(cardWidth * 0.025);
          }

          // Draw details text (Name & Agency info)
          const titleSize = Math.max(13, Math.round(canvas.height * 0.03));
          const subSize = Math.max(10, Math.round(canvas.height * 0.019));

          ctx.textAlign = 'left';
          ctx.textBaseline = 'middle';

          const isBox = !config.layoutType.includes('bar');

          const hasSocials = config.showSocialIcons;
          let textY = centerY - (hasSocials ? titleSize * 0.7 : titleSize * 0.4);
          if (!config.showUserDetails && !hasSocials) textY = centerY;

          if (config.showUserName) {
            ctx.font = `bold ${titleSize}px "Plus Jakarta Sans", sans-serif`;
            ctx.fillStyle = config.textColor;
            ctx.fillText(agent.name, currentX, textY);
            textY += titleSize * 1.1;
          }

          if (config.showUserDetails) {
            ctx.font = `${subSize}px "Plus Jakarta Sans", sans-serif`;
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = config.textColor;
            ctx.fillText(`${agent.agentType || 'Advisor'} | ${agent.company || 'Policybhandar'}`, currentX, textY);
            ctx.globalAlpha = 1.0;
            textY += subSize * 1.4;
          }

          if (config.showSocialIcons) {
            const iconRadius = Math.round(subSize * 0.6);
            let iconX = currentX + iconRadius;
            const iconY = textY;

            // Helper to draw icon
            const drawSocialIcon = (bgColor, letter, x) => {
              ctx.beginPath();
              ctx.arc(x, iconY, iconRadius, 0, Math.PI * 2);
              ctx.fillStyle = bgColor;
              ctx.fill();
              ctx.fillStyle = '#ffffff';
              ctx.font = `bold ${Math.round(iconRadius * 1.2)}px sans-serif`;
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(letter, x, iconY + 1);
            };

            drawSocialIcon('#1877F2', 'f', iconX); // Facebook
            iconX += iconRadius * 2.5;
            drawSocialIcon('#E4405F', 'ig', iconX); // Instagram
            iconX += iconRadius * 2.5;
            drawSocialIcon('#000000', 'X', iconX); // X
            iconX += iconRadius * 2.5;
            drawSocialIcon('#0A66C2', 'in', iconX); // LinkedIn

            textY += subSize * 1.5;
          }

          // Draw Contact phone details
          if (config.showUserMobile) {
            if (isBox) {
              // If it's a box layout, we place mobile under the stack.
              ctx.font = `bold ${subSize}px "Plus Jakarta Sans", sans-serif`;
              ctx.fillStyle = config.textColor;
              ctx.textAlign = 'left';
              ctx.fillText(`Mob: +91 ${agent.mobile}`, currentX, textY);
            } else {
              // Bar layout, place on the right
              const textRight = cardX + cardWidth - paddingX;
              ctx.textAlign = 'right';
              ctx.font = `bold ${titleSize}px "Plus Jakarta Sans", sans-serif`;
              ctx.fillStyle = config.textColor;
              ctx.fillText(`Mob: +91 ${agent.mobile}`, textRight, centerY);
            }
          }

        }

        resolve(canvas.toDataURL('image/jpeg', 0.95));
      } catch (err) {
        console.error('Watermark generation failed:', err);
        reject(err);
      }
    };

    processImage();
  });
};
