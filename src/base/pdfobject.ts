import { PdfObjectType } from './pdfobjecttype.enum';
import { PdfObjectReference } from './pdfobjectreference';

import { TextEncoder } from 'util';
import { ControlCharacters } from '../controlcharacters';

/**
 *
 *
 * @export
 * @abstract
 * @class PdfObject
 */
export abstract class PdfObject {
  /**
   *
   *
   * @type {number}
   * @memberof PdfObject
   */
  public Id: number;

  /**
   *
   *
   * @type {number}
   * @memberof PdfObject
   */
  public Generation: number;

  /**
   *
   *
   * @type {PdfObjectType}
   * @memberof PdfObject
   */
  public Type: PdfObjectType;

  /**
   *
   *
   * @type {PdfObjectReference[]}
   * @memberof PdfObject
   */
  public Kids?: PdfObjectReference[];

  /**
   *
   *
   * @type {PdfObjectReference}
   * @memberof PdfObject
   */
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

    this._compiled = this.compile().join(ControlCharacters.EOL);
    this._byteLength = utf8Encode.encode(this._compiled).length;

    return this._byteLength;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof PdfObject
   */
  compile(): string[] {
    throw 'don\'t call the abstract compile';
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof PdfObject
   */
  startObject(): string[] {
    return [`${this.Id} ${this.Generation} obj`, '<<'];
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof PdfObject
   */
  endObject(): string[] {
    return ['>>', 'endobj'];
  }

  /**
   *
   *
   * @returns {string}
   * @memberof PdfObject
   */
  compileType(): string {
    return `/Type /${this.Type}`;
  }
}
