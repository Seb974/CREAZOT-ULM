import { AeronefsList } from "./AeronefsList";
import { AeronefsCreate } from "./AeronefsCreate";
import { AeronefsEdit } from "./AeronefsEdit";
import { AeronefShow } from "./AeronefShow";

const aeronefResourceProps = {
  list: AeronefsList,
  create: AeronefsCreate,
  edit: AeronefsEdit,
  hasShow: false,
  show: AeronefShow
};

export default aeronefResourceProps;
