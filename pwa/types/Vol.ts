import { Circuit } from "./Circuit";
import { type Item } from "./item";
import { Prestation } from "./Prestation";
import { Option } from "./option";


export class Vol implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public id?: string,
    public circuit?: Circuit,
    public quantite?: number,
    public prestation?: Prestation,
    public duree?: number,
    public prix?: number,
    public option?: Option

  ) {
    this["@id"] = _id;
  }
}
