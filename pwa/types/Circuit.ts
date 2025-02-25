import { type Item } from "./item";
import { type Thumbnails } from "./Thumbnails";

export class Circuit implements Item {
  public "@id"?: string;

  constructor(
    public nom?: string,
    public code?: string,
    public prix?: number,
    public cout?: number,
    public duree?: number,
    _id?: string,
    public id?: string
  ) {
    this["@id"] = _id;
  }
}
