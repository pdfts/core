import { PDFDocument } from '../src/pdfdocument';
describe('doc', function() {
  it('logs', async function() {
    let document = new PDFDocument();
    console.log(await document.pipe());
  });
});
