const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

async function generateInvoicePdf(data) {
  const templatePath = path.join(__dirname, "templates", "invoice.html");
  let htmlTemplate = fs.readFileSync(templatePath, "utf8");

  // --- BAGIAN LOGO ---
  const logoFileName = "logo.png";
  const logoPath = path.join(__dirname, "templates", logoFileName);

  let logoBase64 = "";
  let logoMimeType = "image/png";

  try {
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      logoBase64 = logoBuffer.toString("base64");

      const ext = path.extname(logoFileName).toLowerCase();
      if (ext === ".png") {
        logoMimeType = "image/png";
      } else if (ext === ".gif") {
        logoMimeType = "image/gif";
      } else if (ext === ".svg") {
        logoMimeType = "image/svg+xml";
      }
    }
  } catch (error) {
    logoBase64 = "";
  }

  if (logoBase64) {
    const imgTagRegex =
      /<img\s+src="[^"]+"\s+alt="Rasty Shop Logo"\s+class="logo"\s*\/?>/g;
    const newImgTag = `<img src="data:${logoMimeType};base64,${logoBase64}" alt="Rasty Shop Logo" class="logo">`;
    if (htmlTemplate.match(imgTagRegex)) {
      htmlTemplate = htmlTemplate.replace(imgTagRegex, newImgTag);
    } else {
      console.warn(
        "Peringatan: Tag <img> untuk logo tidak ditemukan atau tidak cocok di template HTML. Logo mungkin tidak ditampilkan."
      );
    }
  } else {
    htmlTemplate = htmlTemplate.replace(
      /<img src="[^"]+" alt="Rasty Shop Logo" class="logo">/g,
      ""
    );
  }
  // --- AKHIR BAGIAN LOGO ---

  // --- Bagian Penggantian Placeholder Invoice ---
  htmlTemplate = htmlTemplate.replace("{{invoiceNo}}", data.invoiceNo || "N/A");
  htmlTemplate = htmlTemplate.replace(
    "{{invoiceDate}}",
    data.date || moment().format("DD MMMM YYYY")
  );
  htmlTemplate = htmlTemplate.replace(
    "{{customerName}}",
    data.customerName || "N/A"
  );
  htmlTemplate = htmlTemplate.replace(
    "{{customerAddress}}",
    data.customerAddress || "Ditempat"
  );

  let itemsHtml = "";
  data.items.forEach((item, index) => {
    itemsHtml += `
      <tr>
        <td>${index + 1}.</td>
        <td>${item.name}</td>
        <td>${item.quantity} Pcs</td>
        <td>Rp. ${item.unitPrice.toLocaleString("id-ID")},-</td>
        <td>Rp. ${item.total.toLocaleString("id-ID")},-</td>
      </tr>
    `;
  });
  htmlTemplate = htmlTemplate.replace("{{invoiceItems}}", itemsHtml);

  htmlTemplate = htmlTemplate.replace(
    '<td colspan="4">SubTotal</td>',
    '<td colspan="4">SubTotal</td>'
  );
  htmlTemplate = htmlTemplate.replace(
    '<td colspan="4">DP 50%</td>',
    '<td colspan="4">DP 50%</td>'
  );
  htmlTemplate = htmlTemplate.replace(
    '<td colspan="4">Pelunasan</td>',
    '<td colspan="4">Pelunasan</td>'
  );

  htmlTemplate = htmlTemplate.replace(
    "{{subTotal}}",
    `Rp. ${data.subTotal.toLocaleString("id-ID")},-`
  );
  htmlTemplate = htmlTemplate.replace(
    "{{dp}}",
    `Rp. ${data.dp.toLocaleString("id-ID")},-`
  );
  htmlTemplate = htmlTemplate.replace(
    "{{pelunasan}}",
    `Rp. ${data.pelunasan.toLocaleString("id-ID")},-`
  );

  htmlTemplate = htmlTemplate.replace(
    "{{timestamp}}",
    moment().format("DD MMMM YYYY, HH:mm:ss")
  );

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setContent(htmlTemplate, { waitUntil: "networkidle0" });
    let pdfBuffer = await page.pdf({ format: "A4" });

    if (!(pdfBuffer instanceof Buffer)) {
      pdfBuffer = Buffer.from(pdfBuffer);
    }

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Error saat membuat PDF dengan Puppeteer:", error);
    throw error;
  }
}

module.exports = { generateInvoicePdf };
