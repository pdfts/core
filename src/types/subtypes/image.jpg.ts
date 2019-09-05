import { PdfObjectReference } from '../../base/pdfobjectreference';
import { TextEncoder } from 'util';

import * as zlib from 'zlib';

import { PNG } from 'pngjs';

export class ImageJPG {
  public BitsPerComponent = 8;

  public ColorSpace: string;

  public Data = '';
  public Length = 0;

  public SubType = 'Image';

  private _readerPosition = 0;

  /**
   *
   */
  constructor(
    private _fileContent: Uint8Array,
    public Width: number,
    public Height: number
  ) {
    this.Data = Buffer.from(_fileContent).toString('binary');
    let utf8Encode = new TextEncoder();
    this.Length = this.Data.length;
  }

  public Compile(): string[] {
    return [
      `/Subtype /${this.SubType}`,
      `/Width ${this.Width}`,
      `/Height ${this.Height}`,
      `/ColorSpace /DeviceRGB`,
      `/BitsPerComponent ${this.BitsPerComponent}`,
      `/Filter /DCTDecode`,
      `/Length ${this.Length}`,
      `>>`,
      `stream`,
      this.Data,
      `endstream`
    ];
  }
}
