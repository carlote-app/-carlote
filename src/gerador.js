const PDFDocument = require("pdfkit");
const fs = require("fs");

function gerarPDF(relatorio, arquivo) {
  const doc = new PDFDocument({ margin: 50 });
  const nomeArquivo = `relatorio-qa-${Date.now()}.pdf`;
  const stream = fs.createWriteStream(nomeArquivo);
  
  doc.pipe(stream);

  // Capa
  doc.rect(0, 0, 612, 150).fill("#534AB7");
  doc.fillColor("white")
     .fontSize(28)
     .font("Helvetica-Bold")
     .text("Carlote", 50, 50);
  doc.fontSize(14)
     .font("Helvetica")
     .text("Relatório de QA", 50, 90);
  doc.fontSize(10)
     .text(`Arquivo: ${arquivo}`, 50, 115);
  doc.text(`Data: ${new Date().toLocaleString("pt-BR")}`, 50, 130);

  doc.moveDown(5);

  // Conteúdo
  doc.fillColor("#2C2C2A")
     .fontSize(10)
     .font("Helvetica")
     .text(relatorio, 50, 170, {
       width: 500,
       align: "left",
       lineGap: 4
     });

  doc.end();

  return new Promise((resolve) => {
    stream.on("finish", () => {
      console.log(`\n📄 PDF gerado: ${nomeArquivo}`);
      resolve(nomeArquivo);
    });
  });
}

module.exports = { gerarPDF };