import { type Item } from "./item";

export class Origine implements Item {
  public "@id"?: string;

  constructor(
    public name?: string,
    public discount?: number,
    _id?: string,
    public id?: string,
  ) {
    this["@id"] = _id;
  }
}
