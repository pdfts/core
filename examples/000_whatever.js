const pdf = require('../dist/pdf');
const fs = require('fs');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);

doc
  .addFont('DiverdaSansCom-Medium')
  .text([
    'BT',
    '  /F0 24 Tf',
    '  100 100 Td',
    '  (abcdefghijklmnopqrstuvwxyz) Tj',
    'ET'
  ]);

fs.writeFile(__dirname + '/test.pdf', doc.compile(), function(err) {
  if (err) {
    return console.log(err);
  }

  console.log('test.pdf saved!');
});
