import { Circuit } from "./Circuit";
import { type Item } from "./item";
import { Prestation } from "./Prestation";
import { Option } from "./option";
import { Landing } from "./Landing";


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
    public option?: Option,
    public landings?: Landing[],

  ) {
    this["@id"] = _id;
  }
}
