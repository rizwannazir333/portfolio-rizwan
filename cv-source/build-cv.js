// Build all four CV PDFs from cv.html (one content source, two designs).
// Usage:  cd cv-source && npm install && npx playwright install chromium && npm run build
//
// 1. Chromium prints cv.html to PDF with the design's margins and page numbers.
// 2. pdf-lib draws each design's background (navy band, Europass frame and logo)
//    underneath the printed text, and keeps the clickable links.

const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const { PDFDocument, PDFName, PDFObjectCopier, rgb } = require("pdf-lib");

const MM = 72 / 25.4; // PDF points per millimetre
const hex = (h) => rgb(parseInt(h.slice(1, 3), 16) / 255, parseInt(h.slice(3, 5), 16) / 255, parseInt(h.slice(5, 7), 16) / 255);

const DESIGNS = {
  academic: {
    margin: { top: 14, right: 15, bottom: 16, left: 20 },
    footer: `<div style="width:100%; font:7pt Inter, Arial, sans-serif; color:#5a6573; padding:0 15mm 0 20mm;
                         display:flex; justify-content:space-between;">
               <span>Rizwan Ali · Curriculum Vitae</span>
               <span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>`,
    files: { photo: "Rizwan_Ali_CV_Photo.pdf", plain: "Rizwan_Ali_CV.pdf" },
    // Navy band on every page; light header background on page 1.
    draw(page, i, { width, height }, headerBottomMm) {
      if (i === 0) {
        const h = headerBottomMm * MM;
        page.drawRectangle({ x: 0, y: height - h, width, height: h, color: hex("#eef3f9") });
        page.drawRectangle({ x: 0, y: height - h, width, height: 0.75, color: hex("#d5dbe3") });
      }
      page.drawRectangle({ x: 0, y: 0, width: 8 * MM, height, color: hex("#1f3a5f") });
    },
  },
  europass: {
    margin: { top: 13, right: 9.5, bottom: 17, left: 9.5 },
    footer: `<div style="width:100%; font:9pt 'Open Sans', Arial, sans-serif; color:#7fa9d8; padding:0 9.5mm;
                         text-align:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>`,
    files: { photo: "Rizwan_Ali_Europass_CV_Photo.pdf", plain: "Rizwan_Ali_Europass_CV.pdf" },
    // Blue frame at the four corners, as in the Europass template; logo on page 1.
    draw(page, i, { width, height }, _, logo) {
      const blue = hex("#82acd8");
      const band = 6.2 * MM, side = 5.8 * MM, stub = 23.8 * MM;
      page.drawRectangle({ x: 0, y: height - band, width, height: band, color: blue });
      page.drawRectangle({ x: 0, y: 0, width, height: band, color: blue });
      for (const x of [0, width - side]) {
        page.drawRectangle({ x, y: height - stub, width: side, height: stub, color: blue });
        page.drawRectangle({ x, y: 0, width: side, height: stub, color: blue });
      }
      if (i === 0) {
        const w = 62.6 * MM, h = (w * logo.height) / logo.width;
        page.drawImage(logo, { x: width - 9.5 * MM - w, y: height - 11.5 * MM - h, width: w, height: h });
      }
    },
  },
};

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

async function addBackground(printedBytes, design, headerBottomMm) {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Rizwan Ali · Curriculum Vitae");
  pdf.setAuthor("Rizwan Ali");
  pdf.setCreator("Rizwan Ali");
  const source = await PDFDocument.load(printedBytes);
  const printedPages = await pdf.embedPdf(printedBytes, source.getPageIndices());
  const logo = await pdf.embedPng(fs.readFileSync(path.join(__dirname, "europass-logo.png")));

  printedPages.forEach((printed, i) => {
    const page = pdf.addPage([printed.width, printed.height]);
    design.draw(page, i, printed, headerBottomMm, logo);
    page.drawPage(printed, { x: 0, y: 0 });
    copyLinks(source.getPage(i), page, source, pdf);
  });
  return pdf.save();
}

(async () => {
  const browser = await chromium.launch();
  for (const [name, design] of Object.entries(DESIGNS)) {
    const m = design.margin;
    // Lay the page out at the printed content width so measurements match the PDF.
    const width = Math.round((210 - m.left - m.right) * (96 / 25.4));
    const page = await browser.newPage({ viewport: { width, height: 1000 } });
    await page.emulateMedia({ media: "print" });
    await page.goto("file://" + path.join(__dirname, "cv.html"), { waitUntil: "networkidle" });
    await page.evaluate((cls) => document.body.classList.add(cls), name);
    await page.evaluate(() => document.fonts.ready);

    for (const [variant, file] of Object.entries(design.files)) {
      await page.evaluate((on) => document.body.classList.toggle("with-photo", on), variant === "photo");
      // Bottom of the visible header (the other design's header is hidden and measures 0).
      const headerBottomPx = await page.evaluate(() =>
        Math.max(...[...document.querySelectorAll(".head")].map((h) => h.getBoundingClientRect().bottom)));
      const printed = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: Object.fromEntries(Object.entries(m).map(([k, v]) => [k, v + "mm"])),
        displayHeaderFooter: true,
        headerTemplate: "<span></span>",
        footerTemplate: design.footer,
      });
      const headerBottomMm = m.top + headerBottomPx * (25.4 / 96);
      fs.writeFileSync(path.join(__dirname, "..", "assets", file), await addBackground(printed, design, headerBottomMm));
      console.log("Saved assets/" + file);
    }
    await page.close();
  }
  await browser.close();
})();
