import { PdfObjectType } from './pdfobjecttype.enum';
import { PdfObjectReference } from './pdfobjectreference';

export abstract class PdfObject {
  public Id: number;

  public Generation: number;

  public Type: PdfObjectType;

  public Kids?: PdfObjectReference[];

  public Parent?: PdfObjectReference;

  /**
   *
   *
   * @private
   * @type {string}
   * @memberof PdfObject
   */
  private _compiled: string = '';
  get precompiled(): string {
    return this._compiled;
  }

  /**
   *
   *
   * @private
   * @type {number}
   * @memberof PdfObject
   */
  private _byteLength: number = 0;

  /**
   *
   *
   * @readonly
   * @type {number}
   * @memberof PdfObject
   */
  get ByteLength(): number {
    let utf8Encode = new TextEncoder();

    this._compiled = this.compile().join('\n') + '\n';
    this._byteLength = utf8Encode.encode(this._compiled).length;

    return this._byteLength;
  }

  compile(): string[] {
    throw 'don\'t call the abstract compile';
  }

  startObject(): string[] {
    return [`${this.Id} ${this.Generation} obj`, '<<'];
  }

  endObject(): string[] {
    return ['>>', 'endobj'];
  }

  compileType(): string {
    return `/Type /${this.Type}`;
  }
}
