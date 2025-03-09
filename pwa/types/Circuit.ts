import { type Item } from "./item";
import { Nature } from "./nature";
export class Circuit implements Item {
  public "@id"?: string;

  constructor(
    public nom?: string,
    public code?: string,
    public prix?: number,
    public cout?: number,
    public duree?: number,
    _id?: string,
    public id?: string,
    public nature?: Nature
  ) {
    this["@id"] = _id;
  }
}
