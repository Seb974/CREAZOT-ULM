import { Aeronef } from "./Aeronef";
import { User } from "./User";
import { Vol } from "./Vol";
import { type Item } from "./item";

export class Prestation implements Item {
  public "@id"?: string;

  constructor(
    _id?: string,
    public id?: string,
    public aeronef?: Aeronef,
    public pilote?: User,
    public vols?: Vol[],
    public date?: string,
    public duree?: number,
    public horametreDepart?: number,
    public horametreFin?: number,
    public turnover?: number,
  ) {
    this["@id"] = _id;
  }
}
