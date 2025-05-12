import { ClientsList } from "./ClientsList";
import { ClientsCreate } from "./ClientsCreate";
import { ClientsEdit } from "./ClientsEdit";
import { ClientShow } from "./ClientShow";

const clientResourceProps = {
  list: ClientsList,
  create: ClientsCreate,
  edit: ClientsEdit,
  hasShow: false,
  show: ClientShow
};

export default clientResourceProps;
