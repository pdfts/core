/**
 *
 *
 * @export
 * @class Offset
 */
export class Offset {
  public Position: number;
  public Generation: number;
  public Free: boolean;
}

/**
 *
 *
 * @export
 * @class Xref
 */
export class Xref {
  public Offsets: Offset[] = [];
  public Offset: number = 0;

  compile(): string[] {
    return [];
  }
}
