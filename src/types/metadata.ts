import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';
import { XMPMeta } from '../structure/xmpmeta';
import { ControlCharacters } from '../controlcharacters';

import { TextEncoder } from 'util';

/**
 *
 *
 * @export
 * @class MetaData
 * @extends {PdfObject}
 */
export class MetaData extends PdfObject {
  /**
   *Creates an instance of MetaData.
   * @param {number} Id
   * @param {number} Generation
   * @param {PdfObjectReference} [Parent]
   * @memberof MetaData
   */
  constructor(
    public Id: number,
    public Generation: number,
    public Parent?: PdfObjectReference
  ) {
    super();

    this.Type = PdfObjectType.Metadata;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof MetaData
   */
  compile(): string[] {
    let xmpmeta = new XMPMeta();
    let metaxml = xmpmeta.compile().join(ControlCharacters.EOL);
    let utf8Encode = new TextEncoder();

    return [
      `${this.Id} ${this.Generation} obj`,
      `<<`,
      `/Length ${utf8Encode.encode(metaxml).length}`,
      `/Type /${this.Type}`,
      `/Subtype /XML`,
      `>>`,
      `stream`,
      metaxml,
      `endstream`,
      `endobj`
    ];
  }
}
