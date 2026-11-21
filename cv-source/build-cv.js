// Build the Academic CV PDFs from academic-cv.html.
// Usage:  cd cv-source && npm install && npx playwright install chromium && npm run build
//
// 1. Chromium prints the HTML to PDF with page margins and a page-number footer.
// 2. pdf-lib draws the navy band on every page and the header background on
//    page 1, underneath the printed text.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PDFDocument, PDFName, PDFObjectCopier, rgb } = require("pdf-lib");

const MM = 72 / 25.4; // PDF points per millimetre
const MARGIN = { top: 14, right: 15, bottom: 16, left: 20 }; // mm
const NAVY = rgb(0x1f / 255, 0x3a / 255, 0x5f / 255);
const TINT = rgb(0xee / 255, 0xf3 / 255, 0xf9 / 255);
const LINE = rgb(0xd5 / 255, 0xdb / 255, 0xe3 / 255);

const footer = `
  <div style="width:100%; font:7pt Inter, Arial, sans-serif; color:#5a6573;
              padding:0 ${MARGIN.right}mm 0 ${MARGIN.left}mm; display:flex; justify-content:space-between;">
    <span>Rizwan Ali · Curriculum Vitae</span>
    <span><span class="pageNumber"></span> / <span class="totalPages"></span></span>
  </div>`;

const versions = [
  { file: "Rizwan_Ali_CV_Photo.pdf", photo: true },
  { file: "Rizwan_Ali_CV.pdf", photo: false },
];

// Keep the clickable links: copy each link annotation onto the new page.
function copyLinks(fromPage, toPage, fromPdf, toPdf) {
  const annots = fromPage.node.Annots();
  if (!annots) return;
  const copier = PDFObjectCopier.for(fromPdf.context, toPdf.context);
  const links = annots.asArray().map((ref) => {
    const annot = fromPdf.context.lookup(ref);
    annot.delete(PDFName.of("P")); // points at the old page
    return toPdf.context.register(copier.copy(annot));
  });
  toPage.node.set(PDFName.of("Annots"), toPdf.context.obj(links));
}

async function addBackground(pdfBytes, headerBottomMm) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Rizwan Ali · Curriculum Vitae");
  pdf.setAuthor("Rizwan Ali");
  pdf.setCreator("Rizwan Ali");
  const source = await PDFDocument.load(pdfBytes);
  const pages = await pdf.embedPdf(pdfBytes, source.getPageIndices());

  pages.forEach((printed, i) => {
    const { width, height } = printed;
    const page = pdf.addPage([width, height]);
    if (i === 0) {
      const tintHeight = headerBottomMm * MM;
      page.drawRectangle({ x: 0, y: height - tintHeight, width, height: tintHeight, color: TINT });
      page.drawRectangle({ x: 0, y: height - tintHeight, width, height: 0.75, color: LINE });
    }
    page.drawRectangle({ x: 0, y: 0, width: 8 * MM, height, color: NAVY });
    page.drawPage(printed, { x: 0, y: 0 });
    copyLinks(source.getPage(i), page, source, pdf);
  });
  return pdf.save();
}

(async () => {
  const browser = await chromium.launch();
  // Lay the page out at the printed content width so the header height matches the PDF.
  const contentWidthPx = Math.round((210 - MARGIN.left - MARGIN.right) * (96 / 25.4));
  const page = await browser.newPage({ viewport: { width: contentWidthPx, height: 1000 } });
  await page.emulateMedia({ media: "print" });
  await page.goto("file://" + path.join(__dirname, "academic-cv.html"), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);

  for (const { file, photo } of versions) {
    await page.evaluate((on) => document.body.classList.toggle("with-photo", on), photo);
    const headerBottomPx = await page.evaluate(() => document.querySelector(".head").getBoundingClientRect().bottom);
    const printed = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: Object.fromEntries(Object.entries(MARGIN).map(([k, v]) => [k, v + "mm"])),
      displayHeaderFooter: true,
      headerTemplate: "<span></span>",
      footerTemplate: footer,
    });
    const headerBottomMm = MARGIN.top + headerBottomPx * (25.4 / 96);
    const finished = await addBackground(printed, headerBottomMm);
    fs.writeFileSync(path.join(__dirname, "..", "assets", file), finished);
    console.log("Saved assets/" + file);
  }
  await browser.close();
})();
