import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

export class FontWidths extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public Widths: number[]
  ) {
    super();

    this.Type = PdfObjectType.FontWidths;
  }

  startObject(): string[] {
    return [`${this.Id} ${this.Generation} obj`];
  }

  endObject(): string[] {
    return ['endobj'];
  }

  compileWidths(): string[] {
    return ['[', this.Widths.join(' '), ']'];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileWidths(),
      ...this.endObject()
    ];
  }
}
