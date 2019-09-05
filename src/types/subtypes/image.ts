import { PdfObjectReference } from '../../base/pdfobjectreference';
import { TextEncoder } from 'util';

import * as zlib from 'zlib';

import { PNG } from 'pngjs';

export class Image {
  public Width: number;
  public Height: number;

  public BitsPerComponent: number;

  public ColorSpaceType: number;
  public ColorSpace: string;

  public Palette = '';
  public Transparency = '';
  public Data = '';
  public Length = 0;

  public SubType = 'Image';
  public PaletteReference: PdfObjectReference;

  private _readerPosition = 0;

  /**
   *
   */
  constructor(private _fileContent: Uint8Array) {
    let png = PNG.sync.read(Buffer.from(_fileContent));
    let buffer = PNG.sync.write(png, { colorType: 2 });
    let png_normalized = PNG.sync.read(buffer);

    console.log(png_normalized);
    _fileContent = new Uint8Array(
      PNG.sync.write(png_normalized, { colorType: 2 })
    );

    //console.log(Buffer.from(_fileContent).toString('binary'));

    this.ColorSpaceType = 2;
    this.ColorSpace = 'DeviceRGB';

    this.Width = png_normalized.width;
    this.Height = png_normalized.height;

    this._parse();
  }

  public Compile(): string[] {
    if (this.ColorSpace === 'Indexed') {
    }

    return [
      `/Subtype /${this.SubType}`,
      `/Width ${this.Width}`,
      `/Height ${this.Height}`,
      this.ColorSpace === 'Indexed'
        ? `/ColorSpace [/Indexed /DeviceRGB 39 ${this.PaletteReference.Id} ${
            this.PaletteReference.Generation
          } R]`
        : `/ColorSpace /${this.ColorSpace}`,
      this.ColorSpace === 'DeviceCMYK' ? '/Decode [1 0 1 0 1 0 1 0]' : '',
      `/BitsPerComponent ${this.BitsPerComponent}`,
      `/Filter /FlateDecode`,
      `/DecodeParms << /Predictor 15 /Colors ${
        this.ColorSpace === 'DeviceRGB' ? 3 : 1
      } /BitsPerComponent ${this.BitsPerComponent} /Columns ${this.Width} >>`,
      `/Length ${this.Length}`,
      `>>`,
      `stream`,
      this.Data,
      `endstream`
    ];
  }

  read(length: number): Uint8Array {
    const chunk = this._fileContent.slice(
      this._readerPosition,
      (this._readerPosition = this._readerPosition + length)
    );

    return chunk;
  }

  readString(length: number): string {
    const chunk = this._fileContent.slice(
      this._readerPosition,
      (this._readerPosition = this._readerPosition + length)
    );
    return Buffer.from(chunk).toString('binary');
  }

  readInt32BE(): number {
    const chunk = this._fileContent.slice(
      this._readerPosition,
      (this._readerPosition = this._readerPosition + 4)
    );
    return Buffer.from(chunk).readInt32BE(0);
  }

  readInt8(): number {
    const chunk = this._fileContent.slice(
      this._readerPosition,
      (this._readerPosition = this._readerPosition + 1)
    );
    return Buffer.from(chunk).readInt8(0);
  }

  private _parse() {
    this._readerPosition = 0;

    if (
      this.read(8).toString() !==
      'PNG' + String.fromCharCode(13, 10, 26, 10)
    ) {
      //throw 'png signature could not be verified';
    }

    // omit header chunk
    this.read(4);

    // IHDR
    if (this.readString(4) !== 'IHDR') {
      //throw 'png header could not be verified';
    }

    this.Width = this.readInt32BE();
    this.Height = this.readInt32BE();

    this.BitsPerComponent = this.readInt8();
    if (this.BitsPerComponent > 8) {
      //throw '16-bit depth is not supportet';
    }

    this.ColorSpaceType = this.readInt8();
    this.ColorSpace = '';
    switch (this.ColorSpaceType) {
      case 0:
      case 4:
        // DeviceGray
        this.ColorSpace = 'DeviceGray';
        break;
      case 2:
      case 6:
        // DeviceRGB
        this.ColorSpace = 'DeviceRGB';
        break;
      case 3:
        // Indexed
        this.ColorSpace = 'Indexed';
        break;
      default:
        throw 'Color Type not readable';
    }

    // compression method
    if (this.readInt8() !== 0) {
      throw 'unknown compression method';
    }

    // filter method
    if (this.readInt8() !== 0) {
      throw 'unknown filter method';
    }

    // interlacing
    if (this.readInt8() !== 0) {
      throw 'interlacing not supported';
    }

    // omit
    this.read(4);

    let next = 0;
    do {
      next = this.readInt32BE();
      const type = this.readString(4);
      if (type === 'PLTE') {
        this.Palette = this.readString(next);
        console.log(this.Palette);
        this.read(4);
      } else if (type === 'tRNS') {
        this.Transparency = this.readString(next);

        // ToDo implement transparency
        if (this.ColorSpaceType === 0) {
          //$trns = array(ord(substr($t, 1, 1)));
        } else if (this.ColorSpaceType === 2) {
          // $trns = array(ord(substr($t,1,1)), ord(substr($t,3,1)), ord(substr($t,5,1)));
        } else {
          // $pos = strpos($t,chr(0));
          // if($pos!==false)
          //    $trns = array($pos);
        }

        this.read(4);
      } else if (type === 'IDAT') {
        this.Length = next;
        this.Data += this.readString(next);

        this.read(4);
      } else if (type === 'IEND') {
        break;
      } else {
        this.read(next + 4);
      }
    } while (next);

    /* not working for now
      if (this.ColorSpaceType > 4) {
      let data = zlib.inflateSync(this.Data).toString();
      let alpha = '';
      let color = '';

      if (this.ColorSpaceType === 4) {
        // grey Image
      } else {
        // RGB Image
        let length = 4 * this.Width;

        for (let i = 0; i < this.Height; i++) {
          let position = (1 + length) * i;

          color += data[position];
          alpha += data[position];

          let line = data.substr(position + 1, length);

          color += line.replace(/(.{3})./s, '$1');
          alpha += line.replace(/.{3}(.)/s, '$1');
        }

        this.Data = zlib.deflateSync(color).toString();
      }
    }*/
  }
}
