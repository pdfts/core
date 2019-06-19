import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';

import { TextEncoder } from 'util';

export class Content extends PdfObject {
  public Stream: string[] = [];

  constructor(public Id: number, public Generation: number) {
    super();

    this.Type = PdfObjectType.Sig;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof PdfObject
   */
  startObject(): string[] {
    let utf8Encode = new TextEncoder();

    return [
      `${this.Id} ${this.Generation} obj`,
      `<< /Length ${utf8Encode.encode(this.Stream.join('\n')).length} >>`
    ];
  }

  /**
   *
   *
   * @returns
   * @memberof EmbeddedFile
   */
  endObject() {
    return ['stream', ...this.Stream, 'endstream', 'endobj'];
  }

  compile(): string[] {
    return [...this.startObject(), ...this.endObject()];
  }
}
