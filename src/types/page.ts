import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';
import { PageSize, PageOrientation } from '../pagesizes';

export class Page extends PdfObject {
  public MediaBox = [0, 0, 600, 400];

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

  compileMediaBox(): string {
    return `/MediaBox [${this.MediaBox[0]} ${this.MediaBox[1]} ${
      this.MediaBox[2]
    } ${this.MediaBox[3]}]`;
  }

  compileResources(): string {
    return `/Resources << >>`;
  }

  compileParent(): string {
    return this.Parent
      ? `/Parent ${this.Parent.Id} ${this.Parent.Generation} R`
      : '';
  }

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
