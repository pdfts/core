const pdf = require('../dist/pdf');
const fs = require('fs');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);

doc
  .addFont('DiverdaSansCom-Medium')
  .text([
    'BT',
    '  /DiverdaSansCom-Medium 24 Tf',
    '  100 100 Td',
    '  2 Tr',
    '  (abcdefghijklmnopqrstuvwxyz)Tj',
    'ET'
  ]);

fs.writeFile(
  __dirname + '/test.pdf',
  doc.compile(),
  { encoding: 'binary' },
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('test.pdf saved!');
  }
);
