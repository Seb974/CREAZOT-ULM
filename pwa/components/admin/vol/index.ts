import { VolsList } from "./VolsList";
// import { PrestationCreate } from "./PrestationCreate";
// import { PrestationEdit } from "./PrestationEdit";
import { type Vol } from "../../../types/Vol";
import { VolShow } from "./VolShow";

const volResourceProps = {
  list: VolsList,
  // create: PrestationCreate,
  // edit: PrestationEdit,
  show: VolShow,
  hasShow: true,
  // recordRepresentation: (record: Prestation) => `${record.title} - ${record.author}`,
};

export default volResourceProps;
