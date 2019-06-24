const pdf = require('../dist/pdf');
const fs = require('fs');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);

doc
  .addStandardFont(pdf.StandardFonts.Helvetica)
  .addStandardFont(pdf.StandardFonts.TimesRoman)
  .addStandardFont(pdf.StandardFonts.CourierBoldOblique)
  .text([
    '2 J',
    '0.57 w',
    '1.000 1.000 0.600 rg',
    'BT /Courier-BoldOblique 16.00 Tf ET',
    '  28.35 785.19 538.58 -28.35 re S q 0 g BT 31.19 766.22 Td (This text is short enough.) Tj ET Q',
    '',
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
