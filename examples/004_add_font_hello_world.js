const pdf = require('../dist/pdf');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);
const fs = require('fs');

doc.addFont('Diverda');

fs.writeFile(
  __dirname + '/004_add_font_hello_world.pdf',
  doc.compile(),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('004_add_font_hello_world.pdf saved!');
  }
);
