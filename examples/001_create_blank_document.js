const pdf = require('../dist/pdf');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);
const fs = require('fs');

fs.writeFile(
  __dirname + '/001_create_blank_document.pdf',
  doc.compile(),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('001_create_blank_document.pdf saved!');
  }
);
