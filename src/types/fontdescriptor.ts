import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { FontFile } from './fontfile';

export class FontDescriptor extends PdfObject {
  public FontBBox = [-166, -225, 1000, 931];

  constructor(
    public Id: number,
    public Generation: number,
    private _fontName: string,
    private _fontFile: FontFile
  ) {
    super();

    this.Type = PdfObjectType.FontDescriptor;
  }

  compileName(): string {
    return `/FontName /${this._fontName}`;
  }

  compileUnprocessed() {
    // ToDo: uhm... ya... you know
    return [
      '/Flags 32',
      `/FontBBox [${this.FontBBox.join(' ')}]`,
      '/ItalicAngle 0',
      '/Ascent 718',
      '/Descent -207',
      '/CapHeight 718',
      '/StemV 88',
      '/MissingWidth 0',
      `/FontFile2 ${this._fontFile.Id} ${this._fontFile.Generation} R`
    ];
  }

  compile(): string[] {
    return [
      ...this.startObject(),
      this.compileName(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
