import { PdfObject } from '../base/pdfobject';
import { PdfObjectType } from '../base/pdfobjecttype.enum';
import { PdfObjectReference } from '../base/pdfobjectreference';

export class Catalog extends PdfObject {
  public Pages: PdfObjectReference;
  public MetaData: PdfObjectReference;

  public attachments: PdfObject[] = [];

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

  compilePageTreeReference(): string {
    return `/Pages ${this.Pages.Id} ${this.Pages.Generation} R`;
  }

  compileMetaDataReference(): string {
    return `/Metadata ${this.MetaData.Id} ${this.MetaData.Generation} R`;
  }

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
