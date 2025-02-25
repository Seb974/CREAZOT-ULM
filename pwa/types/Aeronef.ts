import { type Item } from "./item";

export class Aeronef implements Item {
  public "@id"?: string;

  constructor(
    public immatriculation?: string,
    public horametre?: number,
    public entretien?: number,
    _id?: string,
    public id?: string
  ) {
    this["@id"] = _id;
  }
}
