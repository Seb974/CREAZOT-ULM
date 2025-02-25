import { VolsList } from "./VolsList";
// import { PrestationCreate } from "./PrestationCreate";
// import { PrestationEdit } from "./PrestationEdit";
import { type Vol } from "../../../types/Vol";

const volResourceProps = {
  list: VolsList,
  // create: PrestationCreate,
  // edit: PrestationEdit,
  hasShow: false,
  // recordRepresentation: (record: Prestation) => `${record.title} - ${record.author}`,
};

export default volResourceProps;
