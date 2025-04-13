import { OriginesList } from "./OriginesList";
import { OriginesCreate } from "./OriginesCreate";
import { OriginesEdit } from "./OriginesEdit";
import { OrigineShow } from "./OrigineShow";

const origineResourceProps = {
  list: OriginesList,
  create: OriginesCreate,
  edit: OriginesEdit,
  hasShow: false,
  show: OrigineShow
};

export default origineResourceProps;
