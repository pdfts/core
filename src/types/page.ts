import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';
import { PageSize, PageOrientation } from '../pagesizes';

export class Page extends PdfObject {
  /**
   * The MediaBox is the visible Page rectangle
   *
   * @memberof Page
   */
  public MediaBox = [0, 0, 0, 0];

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

  /**
   *
   *
   * @returns {string}
   * @memberof Page
   */
  compileResources(): string {
    return `/Resources << >>`;
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
   * @returns {string[]}
   * @memberof Page
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      this.compileType(),
      this.compileParent(),
      this.compileMediaBox(),
      this.compileResources(),
      ...this.endObject()
    ];
  }
}
