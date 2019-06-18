const pdf = require('../dist/pdf');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);
const fs = require('fs');

fs.writeFile(__dirname + '/002_add_text.pdf', doc.compile(), function(err) {
  if (err) {
    return console.log(err);
  }

  console.log('002_add_text.pdf saved!');
});
