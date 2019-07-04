import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';
import { PageSize, PageOrientation } from '../pagesizes';
import { Font } from './font';
import { Annot } from './annot';
import { ControlCharacters } from '../controlcharacters';
import { XObject } from './xobject';

export class Page extends PdfObject {
  /**
   * The MediaBox is the visible Page rectangle
   *
   * @memberof Page
   */
  public MediaBox = [0, 0, 0, 0];

  public Contents: PdfObjectReference[] = [];
  public Fonts: Font[] = [];
  public Annots: Annot[] = [];
  public XObjects: XObject[] = [];

  constructor(
    public Id: number,
    public Generation: number,
    private _pagesize: PageSize,
    private _orientation: PageOrientation = PageOrientation.Portrait,
    public Parent?: PdfObjectReference
  ) {
    super();

    this.Type = PdfObjectType.Page;

    if (_orientation === PageOrientation.Portrait) {
      this.MediaBox = [0, 0, _pagesize.width, _pagesize.height];
    } else {
      this.MediaBox = [0, 0, _pagesize.height, _pagesize.width];
    }

    /**		$this->_put('/Rotate '.$this->PageInfo[$n]['rotation']);
     */
  }

  /**
   *
   *
   * @returns {string}
   * @memberof Page
   */
  compileMediaBox(): string {
    return `/MediaBox [${this.MediaBox[0]} ${this.MediaBox[1]} ${
      this.MediaBox[2]
    } ${this.MediaBox[3]}]`;
  }

  compileImages(): string[] {
    return [
      '  /XObject <<',
      ...this.XObjects.map((obj, index) => {
        return `    /Image${index} ${obj.Id} ${obj.Generation} R`;
      }),
      '  >>'
    ];
  }

  /**
   *
   *
   * @returns {string}
   * @memberof Page
   */
  compileResources(): string[] {
    return [
      '/Resources <<',
      '  /ProcSet [/PDF /Text /ImageB /ImageC /ImageI]',
      '  /Font <<',
      ...this.Fonts.map((font, index) => {
        return `    /${font.BaseFont} ${font.Id} ${font.Generation} R`;
      }),
      '  >>',
      ...this.compileImages(),
      '>>'
    ];
  }

  compileContentReferences(): string[] {
    return [
      '/Contents [',
      ...this.Contents.map((content, index) => {
        return ` ${content.Id} ${content.Generation} R`;
      }),
      ']'
    ];
  }

  /**
   *
   *
   * @returns {string}
   * @memberof Page
   */
  compileParent(): string {
    return this.Parent
      ? `/Parent ${this.Parent.Id} ${this.Parent.Generation} R`
      : '';
  }

  /**
   *
   *
   * @returns {string}
   * @memberof Page
   */
  compileAnnotations(): string {
    const annotations = this.Annots.map((annot, index) => {
      return ` ${annot.Id} ${annot.Generation} R`;
    });

    return this.Annots.length
      ? `/Annots [ ${annotations.join(ControlCharacters.sp)} ]`
      : '';
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Page
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      this.compileType(),
      this.compileParent(),
      this.compileMediaBox(),
      ...this.compileContentReferences(),
      ...this.compileResources(),
      this.compileAnnotations(),
      ...this.endObject()
    ];
  }
}
