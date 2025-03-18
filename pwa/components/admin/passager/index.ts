import { PassagersList } from "./PassagersList";
import { PassagersCreate } from "./PassagersCreate";
import { PassagersEdit } from "./PassagersEdit";
import { PassagerShow } from "./PassagerShow";

const passagerResourceProps = {
  list: PassagersList,
  create: PassagersCreate,
  edit: PassagersEdit,
  hasShow: false,
  show: PassagerShow
};

export default passagerResourceProps;
