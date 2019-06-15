import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class FontFile extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public Subtype: string,
    public BaseFont: string,
    public FirstChar: string,
    public LastChar: string,
    public Length: number,
    public Length1: number,
    public Stream: string
  ) {
    super();

    this.Type = PdfObjectType.FontFile;
  }

  endObject() {
    return [
      '>>',
      'stream',
      Buffer.from(this.Stream, 'base64').toString(),
      'endstream',
      'endobj'
    ];
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return ['/Length 83691 /Filter /FlateDecode /Length1 169124'];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
