/**
 *
 *
 * @export
 * @class Trailer
 */
export class Trailer {
  /**
   *
   *
   * @type {string}
   * @memberof Trailer
   */
  public ID: string = 'd41d8cd98f00b204e9800998ecf8427e'; // ToDo: how do these IDs even work?

  /**
   *
   *
   * @param {number} size
   * @param {number} startXref
   * @returns {string[]}
   * @memberof Trailer
   */
  compile(size: number, startXref: number): string[] {
    return [
      'trailer',
      '<<',
      '/ID [',
      `  <${this.ID}>`,
      `  <${this.ID}>`,
      ']',
      '/Root 1 0 R',
      '/Size ' + size,
      '>>',
      'startxref',
      startXref.toString()
    ];
  }
}
