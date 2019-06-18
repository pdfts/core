const pdf = require('../dist/pdf');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);
const fs = require('fs');

doc
  .addAttachment('hello freitag.txt', 'Hello langes wochenende!!!')
  .addAttachment('freutag.txt', 'freitag ist freutag!');

fs.writeFile(
  __dirname + '/005_add_attachment_hello_world.pdf',
  doc.compile(),
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('005_add_attachment_hello_world.pdf saved!');
  }
);
