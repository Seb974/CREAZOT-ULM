import { ModulePacksList } from "./ModulePacksList";
import { ModulePacksCreate } from "./ModulePacksCreate";
import { ModulePacksEdit } from "./ModulePacksEdit";

const modulePackResourceProps = {
  list: ModulePacksList,
  create: ModulePacksCreate,
  edit: ModulePacksEdit,
  hasShow: false,
};

export default modulePackResourceProps;
