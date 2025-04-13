import { type Item } from "./item";

export class Contact implements Item {
  public "@id"?: string;

  constructor(
    public name?: string,
    _id?: string,
    public id?: string,
  ) {
    this["@id"] = _id;
  }
}
