import { CombinaisonsList } from "./CombinaisonsList";
import { CombinaisonsCreate } from "./CombinaisonsCreate";
import { CombinaisonsEdit } from "./CombinaisonsEdit";
import { CombinaisonShow } from "./CombinaisonShow";

const combinaisonResourceProps = {
  list: CombinaisonsList,
  create: CombinaisonsCreate,
  edit: CombinaisonsEdit,
  hasShow: false,
  show: CombinaisonShow
};

export default combinaisonResourceProps;
