import { Readable } from 'stream';
import { PdfObjectReference } from '../../base/pdfobjectreference';
import { TextEncoder } from 'util';

import * as zlib from 'zlib';

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

  /**
   *
   */
  constructor(private _fileContent: string) {
    this._parse();
  }

  public Compile(): string[] {
    let utf8Encode = new TextEncoder();

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

  private _parse() {
    const readable = new Readable();
    readable._read = () => {}; // _read is required but you can noop it
    readable.push(this._fileContent);
    readable.push(null);

    if (
      readable.read(8).toString() !==
      'PNG' + String.fromCharCode(13, 10, 26, 10)
    ) {
      //throw 'png signature could not be verified';
    }

    // omit header chunk
    readable.read(4);

    // IHDR
    if (readable.read(4).toString() !== 'IHDR') {
      //throw 'png header could not be verified';
    }

    this.Width = readable.read(4).readInt32BE(0);
    this.Height = readable.read(4).readInt32BE(0);

    this.BitsPerComponent = readable.read(1).readInt8(0);
    if (this.BitsPerComponent > 8) {
      //throw '16-bit depth is not supportet';
    }

    this.ColorSpaceType = readable.read(1).readInt8(0);
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
    if (readable.read(1).readInt8(0) !== 0) {
      throw 'unknown compression method';
    }

    // filter method
    if (readable.read(1).readInt8(0) !== 0) {
      throw 'unknown filter method';
    }

    // interlacing
    if (readable.read(1).readInt8(0) !== 0) {
      throw 'interlacing not supported';
    }

    // omit
    readable.read(4);

    let next = 0;
    do {
      next = readable.read(4).readInt32BE(0);
      const type = readable.read(4).toString();
      if (type === 'PLTE') {
        this.Palette = readable.read(next).toString('binary');
        console.log(this.Palette);
        readable.read(4);
      } else if (type === 'tRNS') {
        this.Transparency = readable.read(next);

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

        readable.read(4);
      } else if (type === 'IDAT') {
        this.Length = next;
        this.Data += readable.read(next).toString('binary');

        readable.read(4);
      } else if (type === 'IEND') {
        break;
      } else {
        readable.read(next + 4);
      }
    } while (next);
  }
}
