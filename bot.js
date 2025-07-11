const { Telegraf, Scenes, session } = require("telegraf");
const { generateInvoicePdf } = require("./pdfGenerator");
const moment = require("moment");
const fs = require("fs");
const path = require("path");

require("moment/locale/id");
moment.locale("id");

const bot = new Telegraf(process.env.BOT_TOKEN);

const invoiceData = {};

const logFilePath = path.join(__dirname, "log.txt");

const invoiceScene = new Scenes.WizardScene(
  "invoice-scene",
  async (ctx) => {
    if (
      ctx.message &&
      ctx.message.text &&
      ctx.message.text.toLowerCase() === "/batal"
    ) {
      ctx.reply(
        "Proses pembuatan invoice dibatalkan.\n\nKetik /start atau /invoice untuk membuat invoice baru."
      );
      return ctx.scene.leave();
    }
    ctx.reply(
      "Halo!\nMari kita buat invoice baru.\nMasukkan nama pelanggan : \n\nAtau ketik /batal untuk membatalkan."
    );
    ctx.wizard.state.invoice = {};
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (
      ctx.message &&
      ctx.message.text &&
      ctx.message.text.toLowerCase() === "/batal"
    ) {
      ctx.reply(
        "Proses pembuatan invoice dibatalkan.\n\nKetik /start atau /invoice untuk membuat invoice baru."
      );
      return ctx.scene.leave();
    }
    if (!ctx.message.text) {
      return ctx.reply("Mohon masukkan nama pelanggan :");
    }
    ctx.wizard.state.invoice.customerName = ctx.message.text;
    ctx.reply(
      "Masukkan alamat pelanggan :\n\nAtau ketik /batal untuk membatalkan"
    );
    return ctx.wizard.next();
  },
  async (ctx) => {
    if (
      ctx.message &&
      ctx.message.text &&
      ctx.message.text.toLowerCase() === "/batal"
    ) {
      ctx.reply(
        "Proses pembuatan invoice dibatalkan\n\nKetik /start atau /invoice untuk membuat invoice baru."
      );
      return ctx.scene.leave();
    }
    if (!ctx.message.text) {
      return ctx.reply("Mohon masukkan alamat pelanggan : ");
    }
    ctx.wizard.state.invoice.customerAddress = ctx.message.text;
    ctx.wizard.state.invoice.items = [];
    ctx.reply(
      "Tambahkan produk\n\nFormat:\nNama produk, Qty, Harga Satuan\n(Cth: Box, 150, 1000) *gunakan koma\n\nAtau ketik /batal untuk membatalkan."
    );

    return ctx.wizard.next();
  },
  async (ctx) => {
    const messageText = ctx.message.text;

    if (messageText.toLowerCase() === "/batal") {
      ctx.reply(
        "Proses pembuatan invoice dibatalkan\n\nKetik /start atau /invoice untuk membuat invoice baru."
      );
      return ctx.scene.leave();
    }

    if (messageText.toLowerCase() === "/selesai") {
      if (ctx.wizard.state.invoice.items.length === 0) {
        ctx.reply(
          "Anda belum menambahkan produk apapun!\nHarap tambahkan setidaknya satu produk.\n\nAtau ketik /batal untuk membatalkan."
        );
        return;
      }
      let subTotal = 0;
      ctx.wizard.state.invoice.items.forEach((item) => {
        subTotal += item.total;
      });
      ctx.wizard.state.invoice.subTotal = subTotal;
      ctx.wizard.state.invoice.dp = subTotal * 0.5;
      ctx.wizard.state.invoice.pelunasan = subTotal * 0.5;

      ctx.reply("Invoice sedang dibuat, mohon tunggu ...");
      const invoiceData = ctx.wizard.state.invoice;
      invoiceData.date = moment().format("DD MMMM YYYY");
      invoiceData.invoiceNo = `INV-${moment().format("DDMMYYYY-ssmmHH")}`;

      try {
        const pdfBuffer = await generateInvoicePdf(invoiceData);

        if (pdfBuffer && pdfBuffer instanceof Buffer) {
          const filename = `Invoice_${
            invoiceData.customerName
          }_${moment().format("DDMMYYYY-ssmmHH")}.pdf`;

          await ctx.replyWithDocument({
            source: pdfBuffer,
            filename: filename,
          });
          ctx.reply(
            "Invoice berhasil dibuat dan dikirim!\n\nKetik /start atau /invoice untuk membuat invoice baru."
          );

          const timestamp = moment().format("YYYY-MM-DD HH:mm:ss");
          const logMessage = `[${timestamp}] Invoice telah dibuat - ${filename}\n`;

          fs.appendFile(logFilePath, logMessage, (err) => {
            if (err) {
              console.error(`Gagal menulis log ke file ${logFilePath}:`, err);
            }
          });
        } else {
          console.error(
            "generateInvoicePdf tidak mengembalikan buffer PDF yang valid. Tipe: " +
              typeof pdfBuffer +
              ", Apakah Buffer: " +
              (pdfBuffer instanceof Buffer)
          );
          ctx.reply("Maaf, gagal membuat PDF invoice. Output PDF tidak valid.");
        }
      } catch (error) {
        console.error(
          "Terjadi kesalahan saat membuat atau mengirim PDF:",
          error
        );
        ctx.reply(
          "Maaf, terjadi kesalahan saat membuat invoice. Mohon coba lagi."
        );
      }
      return ctx.scene.leave();
    }

    const parts = messageText.split(",");
    if (parts.length === 3) {
      const itemName = parts[0].trim();
      const quantity = parseInt(parts[1].trim());
      const unitPrice = parseFloat(parts[2].trim());

      if (
        isNaN(quantity) ||
        isNaN(unitPrice) ||
        quantity <= 0 ||
        unitPrice <= 0
      ) {
        return ctx.reply(
          "Format salah atau nilai tidak valid.\n\nHarap gunakan format:\nNama produk, Qty, Harga Satuan\n(Cth: Box, 150, 1000) *gunakan koma\n\nAtau ketik /batal untuk membatalkan."
        );
      }

      const total = quantity * unitPrice;
      ctx.wizard.state.invoice.items.push({
        name: itemName,
        quantity: quantity,
        unitPrice: unitPrice,
        total: total,
      });
      ctx.reply(
        "Data berhasil ditambahkan!!\nAnda bisa menambahkan produk lagi!\n\nFormat:\nNama produk, Qty, Harga Satuan\n(Cth: Box, 150, 1000) *gunakan koma\n\nAtau ketik /selesai untuk mendapatkan file invoice"
      );
    } else {
      ctx.reply(
        "Format salah!!!\n\nHarap gunakan format:\nNama produk, Qty, Harga Satuan\n(Cth: Box, 150, 1000) *gunakan koma\n\nAtau ketik /batal untuk membatalkan."
      );
    }
  }
);

const stage = new Scenes.Stage([invoiceScene]);
bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) =>
  ctx.reply("Selamat datang! Ketik /invoice untuk membuat invoice baru.")
);
bot.command("invoice", (ctx) => ctx.scene.enter("invoice-scene"));
bot.help((ctx) => ctx.reply("Ketik /invoice untuk membuat invoice baru."));

bot.command("batal", (ctx) => {
  if (ctx.scene.current) {
    ctx.reply(
      "Proses saat ini dibatalkan.\n\nKetik /start atau /invoice untuk membuat invoice baru."
    );
    ctx.scene.leave();
  } else {
    ctx.reply(
      "Tidak ada proses invoice yang sedang berjalan untuk dibatalkan.\n\nKetik /start atau /invoice untuk membuat invoice baru."
    );
  }
});

module.exports = { bot };
