const pdf = require('../dist/pdf');
const doc = new pdf.PDFDocument(pdf.PageSizes.A4);
const fs = require('fs');

fs.writeFile(__dirname + '/003_add_headlines.pdf', doc.compile(), function(
  err
) {
  if (err) {
    return console.log(err);
  }

  console.log('003_add_headlines.pdf saved!');
});
