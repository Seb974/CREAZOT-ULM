import { RappelsList } from "./RappelsList";
import { RappelsCreate } from "./RappelsCreate";
import { RappelsEdit } from "./RappelsEdit";
import { RappelShow } from "./RappelShow";

const rappelResourceProps = {
  list: RappelsList,
  create: RappelsCreate,
  edit: RappelsEdit,
  hasShow: false,
  show: RappelShow
};

export default rappelResourceProps;
