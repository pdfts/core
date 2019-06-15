import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { FontDescriptor } from './fontdescriptor';
import { FontWidths } from './fontwidths';
import { FontEncoding } from './fontencoding';
import { FontFile } from './fontfile';

export class Font extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    private _fontFile: FontFile,
    private _fontDescriptor: FontDescriptor,
    private _fontWidths: FontWidths
  ) {
    super();

    this.Type = PdfObjectType.Font;
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return [
      `/Type /Font`,
      `/Subtype /TrueType`,
      `/BaseFont /${this._fontDescriptor.FontName}`,
      `/FirstChar ${this._fontFile.FirstChar}`,
      `/LastChar ${this._fontFile.LastChar}`,
      `/Widths ${this._fontWidths.Id} ${this._fontWidths.Generation} R`
    ];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
