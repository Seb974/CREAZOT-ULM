import { type Item } from "./item";

export class Option implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public id?: string,
    public nom?: string,
    public prix?: number,
  ) {
    this["@id"] = _id;
  }
}
