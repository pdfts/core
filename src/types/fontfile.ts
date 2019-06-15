import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

/**
 *
 *
 * @export
 * @class FontFile
 * @extends {PdfObject}
 */
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

  /**
   *
   *
   * @returns
   * @memberof FontFile
   */
  endObject() {
    return [
      '>>',
      'stream',
      Buffer.from(this.Stream, 'base64').toString(),
      'endstream',
      'endobj'
    ];
  }

  /**
   *
   *
   * @returns
   * @memberof FontFile
   */
  compileUnprocessed() {
    return [
      `/Length ${this.Length}`,
      `/Length1 ${this.Length1}`,
      `/Filter /FlateDecode`
    ];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof FontFile
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      ...this.compileUnprocessed(),
      ...this.endObject()
    ];
  }
}
