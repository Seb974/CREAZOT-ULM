import { type Item } from "./item";

export class Nature implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public id?: string,
    public code?: string,
    public label?: string,
  ) {
    this["@id"] = _id;
  }
}
