import { type Item } from "./item";
import { Vol } from "./Vol";

export class Landing implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public id?: string,
    public airportCode?: string,
    public airportName?: string,
    public touches?: number,
    public complets?: number,
    public vol?: Vol,
  ) {
    this["@id"] = _id;
  }
}
