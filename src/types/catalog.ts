import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';

/**
 *
 *
 * @export
 * @class Catalog
 * @extends {PdfObject}
 */
export class Catalog extends PdfObject {
  /**
   *
   *
   * @type {PdfObjectReference}
   * @memberof Catalog
   */
  public Pages: PdfObjectReference;

  /**
   *
   *
   * @type {PdfObjectReference}
   * @memberof Catalog
   */
  public MetaData: PdfObjectReference;

  /**
   *
   *
   * @type {PdfObject[]}
   * @memberof Catalog
   */
  public attachments: PdfObject[] = [];

  /**
   *Creates an instance of Catalog.
   * @param {number} Id
   * @param {number} Generation
   * @param {PdfObjectReference[]} [Kids]
   * @memberof Catalog
   */
  constructor(
    public Id: number,
    public Generation: number,
    public Kids?: PdfObjectReference[]
  ) {
    super();

    this.Type = PdfObjectType.Catalog;
    /**
     * 	if($this->ZoomMode=='fullpage')
          $this->_put('/OpenAction ['.$n.' 0 R /Fit]');
        elseif($this->ZoomMode=='fullwidth')
          $this->_put('/OpenAction ['.$n.' 0 R /FitH null]');
        elseif($this->ZoomMode=='real')
          $this->_put('/OpenAction ['.$n.' 0 R /XYZ null null 1]');
        elseif(!is_string($this->ZoomMode))
          $this->_put('/OpenAction ['.$n.' 0 R /XYZ null null '.sprintf('%.2F',$this->ZoomMode/100).']');
        if($this->LayoutMode=='single')
          $this->_put('/PageLayout /SinglePage');
        elseif($this->LayoutMode=='continuous')
          $this->_put('/PageLayout /OneColumn');
        elseif($this->LayoutMode=='two')
          $this->_put('/PageLayout /TwoColumnLeft');
     * 
     */
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Catalog
   */
  compileAttachments(): string[] {
    if (this.attachments.length) {
      return [
        `/Names << /EmbeddedFiles ${this.attachments[0].Id} ${
          this.attachments[0].Generation
        } R >>`,
        '/PageMode /UseAttachments'
      ];
    }
    return [];
  }

  /**
   *
   *
   * @returns {string}
   * @memberof Catalog
   */
  compilePageTreeReference(): string {
    return `/Pages ${this.Pages.Id} ${this.Pages.Generation} R`;
  }

  /**
   *
   *
   * @returns {string}
   * @memberof Catalog
   */
  compileMetaDataReference(): string {
    return `/Metadata ${this.MetaData.Id} ${this.MetaData.Generation} R`;
  }

  /**
   *
   *
   * @returns {string[]}
   * @memberof Catalog
   */
  compile(): string[] {
    return [
      ...this.startObject(),
      this.compileType(),
      this.compilePageTreeReference(),
      this.compileMetaDataReference(),
      ...this.compileAttachments(),
      ...this.endObject()
    ];
  }
}
