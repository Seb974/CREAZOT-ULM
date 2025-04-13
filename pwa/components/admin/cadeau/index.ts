import { CadeauxList } from "./CadeauxList";
import { CadeauxCreate } from "./CadeauxCreate";
import { CadeauxEdit } from "./CadeauxEdit";
import { CadeauShow } from "./CadeauShow";

const cadeauResourceProps = {
  list: CadeauxList,
  create: CadeauxCreate,
  edit: CadeauxEdit,
  hasShow: false,
  show: CadeauShow
};

export default cadeauResourceProps;
