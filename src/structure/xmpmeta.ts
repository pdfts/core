/**
 *
 *
 * @export
 * @class XMPMeta
 */
export class XMPMeta {
  /**
   *
   *
   * @returns {string[]}
   * @memberof XMPMeta
   */
  compile(): string[] {
    return [
      `<x:xmpmeta xmlns:x='adobe:ns:meta/' x:xmptk='Insert XMP tool name here.'>`,
      `  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">`,
      `    <rdf:Description rdf:about="" xmlns:pdfaid="http://www.aiim.org/pdfa/ns/id/">`,
      `      <pdfaid:part>3</pdfaid:part>`,
      `      <pdfaid:conformance>U</pdfaid:conformance>`,
      `    </rdf:Description>`,
      `  </rdf:RDF>`,
      `</x:xmpmeta>`
    ];
  }
}
