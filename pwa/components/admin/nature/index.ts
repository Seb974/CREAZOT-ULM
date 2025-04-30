import { NaturesList } from "./NaturesList";
import { NaturesCreate } from "./NaturesCreate";
import { NaturesEdit } from "./NaturesEdit";
import { NatureShow } from "./NatureShow";

const natureResourceProps = {
  list: NaturesList,
  create: NaturesCreate,
  edit: NaturesEdit,
  hasShow: false,
  show: NatureShow
};

export default natureResourceProps;
