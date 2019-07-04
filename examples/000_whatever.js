const fs = require('fs');
const pdf = require('../dist/pdf');
const signer = require('node-signpdf').SignPdf;
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);

doc
  .addStandardFont(pdf.StandardFonts.CourierBoldOblique)
  .text(['2 J', '0.57 w', 'q 61.68 0 0 47.04 28.35 766.50 cm /Image0 Do Q'])
  .addAttachment('biometric_data.json', '{}')
  .addSignatureField(fs.readFileSync(__dirname + '/logo.png'));

let signedPdfBuffer = new signer().sign(
  Buffer.from(doc.compile(), 'binary'),
  fs.readFileSync(
    'C:\\Users\\indamed\\Documents\\github\\node-signpdf\\certificate.p12'
  )
);
const { verified } = new signer().verify(
  fs.readFileSync(__dirname + '/test_signed.pdf')
);

console.log(verified);

fs.writeFile(
  __dirname + '/test_signed2.pdf',
  signedPdfBuffer,
  { encoding: 'binary' },
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('test_signed2.pdf saved!');
  }
);

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
