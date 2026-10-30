const PDFDocument = require('pdfkit');

/**
 * Generate a PDF invoice stream for a B2B order
 * @param {Object} order Populated order document
 * @param {Object} dataCallback Stream callback or direct response piping
 */
const generateInvoicePDF = (order, res) => {
  const doc = new PDFDocument({ margin: 40, size: 'A4' });

  // Stream directly to HTTP response
  doc.pipe(res);

  // Colors
  const primaryColor = '#1e3a8a'; // Deep Indigo/Navy
  const secondaryColor = '#475569'; // Slate
  const accentColor = '#0284c7'; // Cyan
  const lightBg = '#f8fafc';

  // 1. Header & Brand
  doc
    .fillColor(primaryColor)
    .fontSize(22)
    .text('MERCHHIVE B2B', 40, 40, { bold: true })
    .fontSize(9)
    .fillColor(secondaryColor)
    .text('Connecting Verified Suppliers with Businesses Worldwide', 40, 68)
    .text('Platform Support: billing@merchhive.com | GSTIN: 07AAACB1234D1Z2', 40, 80);

  // Invoice Title Right Aligned
  doc
    .fillColor(primaryColor)
    .fontSize(18)
    .text('TAX INVOICE', 350, 40, { align: 'right', bold: true })
    .fontSize(10)
    .fillColor(secondaryColor)
    .text(`Invoice No: INV-${order.orderNumber}`, 350, 64, { align: 'right' })
    .text(`Order Date: ${new Date(order.createdAt).toLocaleDateString()}`, 350, 78, { align: 'right' })
    .text(`Payment: ${order.paymentMethod?.toUpperCase()} (${order.paymentStatus?.toUpperCase()})`, 350, 92, { align: 'right' });

  // Divider Line
  doc
    .moveTo(40, 115)
    .lineTo(555, 115)
    .strokeColor('#cbd5e1')
    .lineWidth(1)
    .stroke();

  // 2. Supplier & Buyer Information Boxes
  const topY = 125;

  // Supplier Box
  doc
    .rect(40, topY, 245, 100)
    .fillAndStroke(lightBg, '#e2e8f0');

  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .text('SUPPLIER / CONSIGNOR:', 50, topY + 10, { bold: true })
    .fillColor('#1e293b')
    .text(order.supplierCompany?.name || 'Authorized Supplier Entity', 50, topY + 25)
    .fillColor(secondaryColor)
    .fontSize(9)
    .text(`Tax ID/GST: ${order.supplierCompany?.taxId || 'GSTIN-SUPPLIER-PENDING'}`, 50, topY + 40)
    .text(`Email: ${order.supplier?.email || 'N/A'}`, 50, topY + 54)
    .text(`Type: ${order.supplierCompany?.businessType?.toUpperCase() || 'MANUFACTURER'}`, 50, topY + 68);

  // Buyer Box
  doc
    .rect(310, topY, 245, 100)
    .fillAndStroke(lightBg, '#e2e8f0');

  const addr = order.shippingAddress || {};
  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .text('BILLED & SHIPPED TO (BUYER):', 320, topY + 10, { bold: true })
    .fillColor('#1e293b')
    .text(addr.companyName || order.buyerCompany?.name || 'Buyer Enterprise', 320, topY + 25)
    .fillColor(secondaryColor)
    .fontSize(9)
    .text(`GST / Tax ID: ${addr.gstNumber || order.buyerCompany?.taxId || 'N/A'}`, 320, topY + 40)
    .text(`Contact: ${addr.contactName} (${addr.phone})`, 320, topY + 54)
    .text(`Address: ${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} ${addr.zip || ''}`, 320, topY + 68, { width: 225 });

  // 3. Items Table Header
  const tableTopY = 245;
  doc
    .rect(40, tableTopY, 515, 22)
    .fill('#1e3a8a');

  doc
    .fillColor('#ffffff')
    .fontSize(9)
    .text('ITEM DESCRIPTION', 48, tableTopY + 6, { bold: true })
    .text('SKU', 250, tableTopY + 6)
    .text('QTY / UNIT', 330, tableTopY + 6)
    .text('RATE (INR)', 410, tableTopY + 6)
    .text('AMOUNT (INR)', 480, tableTopY + 6);

  // Items Content
  let currentY = tableTopY + 24;
  (order.items || []).forEach((item, index) => {
    const isEven = index % 2 === 0;
    if (isEven) {
      doc.rect(40, currentY, 515, 22).fill('#f8fafc');
    }

    doc
      .fillColor('#0f172a')
      .fontSize(9)
      .text(item.name ? item.name.substring(0, 32) : 'B2B Catalog Item', 48, currentY + 6)
      .fillColor(secondaryColor)
      .text(item.sku || 'SKU-GEN', 250, currentY + 6)
      .text(`${item.quantity} ${item.unit || 'units'}`, 330, currentY + 6)
      .text(`₹${Number(item.unitPrice).toLocaleString('en-IN')}`, 410, currentY + 6)
      .fillColor('#0f172a')
      .text(`₹${Number(item.totalPrice).toLocaleString('en-IN')}`, 480, currentY + 6);

    currentY += 24;
  });

  // 4. Totals & Tax Summary
  const summaryY = currentY + 15;
  doc
    .rect(330, summaryY, 225, 105)
    .fillAndStroke('#f1f5f9', '#cbd5e1');

  doc
    .fillColor(secondaryColor)
    .fontSize(9)
    .text('Subtotal:', 340, summaryY + 10)
    .text(`₹${Number(order.subtotal).toLocaleString('en-IN')}`, 480, summaryY + 10)
    .text('Applicable GST (18%):', 340, summaryY + 28)
    .text(`₹${Number(order.taxAmount).toLocaleString('en-IN')}`, 480, summaryY + 28)
    .text('Freight / Shipping:', 340, summaryY + 46)
    .text(`₹${Number(order.shippingFee).toLocaleString('en-IN')}`, 480, summaryY + 46);

  doc
    .moveTo(340, summaryY + 64)
    .lineTo(545, summaryY + 64)
    .strokeColor('#94a3b8')
    .stroke();

  doc
    .fillColor(primaryColor)
    .fontSize(11)
    .text('Total Invoice Amount:', 340, summaryY + 75, { bold: true })
    .text(`₹${Number(order.totalAmount).toLocaleString('en-IN')}`, 470, summaryY + 75, { bold: true });

  // 5. Terms & Signatures
  const footerY = 560;
  doc
    .fillColor(primaryColor)
    .fontSize(10)
    .text('Terms & Trade Conditions:', 40, footerY, { bold: true })
    .fillColor(secondaryColor)
    .fontSize(8)
    .text('1. Payment is governed by B2B credit terms or instant gateway as acknowledged in the MerchHive agreement.', 40, footerY + 15)
    .text('2. Goods once dispatched are backed by Verified Supplier Quality Assurance & Platform Dispute Protection.', 40, footerY + 27)
    .text('3. This is a computer-generated tax invoice verified under the Information Technology Act.', 40, footerY + 39);

  doc
    .rect(400, footerY, 155, 60)
    .strokeColor('#cbd5e1')
    .stroke();

  doc
    .fillColor(secondaryColor)
    .fontSize(8)
    .text('For MerchHive Authorized Supplier', 405, footerY + 5)
    .text('(Digitally Verified Signature)', 405, footerY + 45, { align: 'center' });

  doc.end();
};

module.exports = { generateInvoicePDF };
