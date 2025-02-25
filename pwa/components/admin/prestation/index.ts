import { PrestationsList } from "./PrestationsList";
import { PrestationCreate } from "./PrestationCreate";
import { PrestationEdit } from "./PrestationEdit";
import { type Prestation } from "../../../types/Prestation";

const prestationResourceProps = {
  list: PrestationsList,
  create: PrestationCreate,
  edit: PrestationEdit,
  hasShow: false,
  // recordRepresentation: (record: Prestation) => `${record.title} - ${record.author}`,
};

export default prestationResourceProps;
