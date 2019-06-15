import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { FontFile } from './fontfile';

/**
 *
 *
 * @export
 * @class FontDescriptor
 * @extends {PdfObject}
 */
export class FontDescriptor extends PdfObject {
  constructor(
    public Id: number,
    public Generation: number,
    public FontName: string,
    public FontFamily: string,
    public FontStretch: number,
    public FontWeight: number,
    public Flags: number,
    public FontBBox: number[],
    public ItalicAngle: number,
    public Ascent: number,
    public Descent: number,
    public CapHeight: number,
    public XHeight: number,
    public StemV: number,
    public AvgWidth: number,
    public MaxWidth: number,
    private _fontFile: FontFile
  ) {
    super();

    this.Type = PdfObjectType.FontDescriptor;
  }

  /**
   *
   *
   * @returns
   * @memberof FontDescriptor
   */
  compileUnprocessed() {
    return [
      `/FontName /${this.FontName}`,
      `/FontFamily ${this.FontFamily}`,
      `/FontStretch ${this.FontStretch}`,
      `/FontWeight ${this.FontWeight}`,
      `/Flags ${this.Flags}`,
      `/FontBBox [${this.FontBBox.join(' ')}]`,
      `/ItalicAngle ${this.ItalicAngle}`,
      `/Ascent ${this.Ascent}`,
      `/Descent ${this.Descent}`,
      `/CapHeight ${this.CapHeight}`,
      `/XHeight ${this.XHeight}`,
      `/StemV ${this.StemV}`,
      `/AvgWidth ${this.AvgWidth}`,
      `/MaxWidth ${this.MaxWidth}`,
      `/FontFile2 ${this._fontFile.Id} ${this._fontFile.Generation} R`
    ];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof FontDescriptor
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
