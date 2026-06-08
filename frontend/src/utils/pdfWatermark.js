import { PDFDocument, rgb } from 'pdf-lib';

/**
 * Dynamically adds a branding watermark banner at the bottom of each page of a PDF.
 * @param {string} pdfUrl - The source URL of the PDF.
 * @param {object} agent - The agent data { name, mobile, company, agentType }.
 * @returns {Promise<string>} - Resolves to a Blob URL of the watermarked PDF.
 */
export const watermarkPDF = async (pdfUrl, agent) => {
  try {
    // 1. Fetch PDF buffer
    const response = await fetch(pdfUrl);
    if (!response.ok) throw new Error('Failed to fetch PDF file');
    const pdfBytes = await response.arrayBuffer();

    // 2. Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    // 3. Apply watermark banner to every page
    for (const page of pages) {
      const { width, height } = page.getSize();
      const barHeight = 35; // compact footer height

      // Draw dark translucent bar
      page.drawRectangle({
        x: 0,
        y: 0,
        width: width,
        height: barHeight,
        color: rgb(0.04, 0.06, 0.12), // #0b1021
        opacity: 0.9,
      });

      // Draw top divider line
      page.drawRectangle({
        x: 0,
        y: barHeight - 2,
        width: width,
        height: 2,
        color: rgb(0.66, 0.33, 0.97), // purple accent color
      });

      // Format agent details text
      const leftText = `${agent.name || 'Advisor'} | ${agent.agentType || 'Advisor'}`;
      const rightText = `Mob: +91 ${agent.mobile || ''} | ${agent.company || 'Policybhandar'}`;

      // Draw agent name and details (left-aligned)
      page.drawText(leftText, {
        x: 15,
        y: 12,
        size: 8,
        color: rgb(1, 1, 1),
      });

      // Draw contact details (right-aligned, dynamically offset)
      const approxTextWidth = 220;
      const rightX = Math.max(15, width - approxTextWidth - 15);
      page.drawText(rightText, {
        x: rightX,
        y: 12,
        size: 8,
        color: rgb(1, 1, 1),
      });
    }

    // 4. Save and return PDF as a blob URL
    const modifiedPdfBytes = await pdfDoc.save();
    const blob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });
    return URL.createObjectURL(blob);
  } catch (err) {
    console.error('PDF watermarking failed, using original:', err);
    return pdfUrl;
  }
};
