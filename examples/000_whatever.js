const fs = require('fs');
const pdf = require('../dist/pdf');
const signer = require('node-signpdf').SignPdf;
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);
/*
doc
  .addStandardFont(pdf.StandardFonts.CourierBoldOblique)
  .text(['2 J', '0.57 w', 'q 410.88 0 0 102.72 28.35 710.82 cm /Image0 Do Q'])
  .addAttachment('biometric_data.json', '{}')
  .addSignatureField(fs.readFileSync(__dirname + '/logo.jpg'));

let signedPdfBuffer = new signer().sign(
  fs.readFileSync(__dirname + '/unsigned.pdf'),
  //Buffer.from(doc.compile(), 'binary'),
  fs.readFileSync(
    'C:\\Users\\indamed\\Documents\\github\\node-signpdf\\certificate.p12'
  )
);

fs.writeFile(
  __dirname + '/signed.pdf',
  signedPdfBuffer,
  { encoding: 'binary' },
  function(err) {
    if (err) {
      return console.log(err);
    }

    console.log('signed.pdf saved!');
  }
);*/

const { verified } = new signer().verify(
  fs.readFileSync(__dirname + '/signed.pdf')
);
console.log(verified);

/*
const { verified } = new signer().verify(
  fs.readFileSync(__dirname + '/signed.pdf')
);
console.log(verified);


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

*/
