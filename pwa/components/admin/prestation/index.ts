import { PrestationsList } from "./PrestationsList";
import { PrestationCreate } from "./PrestationCreate";
import { PrestationEdit } from "./PrestationEdit";
import { type Prestation } from "../../../types/Prestation";
import { PrestationShow } from "./PrestationShow";

const prestationResourceProps = {
  list: PrestationsList,
  create: PrestationCreate,
  edit: PrestationEdit,
  show: PrestationShow,
  hasShow: true,
};

export default prestationResourceProps;
