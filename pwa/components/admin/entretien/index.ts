import { EntretiensList } from "./EntretiensList";
import { EntretiensCreate } from "./EntretiensCreate";
import { EntretiensEdit } from "./EntretiensEdit";
import { EntretienShow } from "./EntretienShow";

const entretienResourceProps = {
  list: EntretiensList,
  create: EntretiensCreate,
  edit: EntretiensEdit,
  hasShow: false,
  show: EntretienShow
};

export default entretienResourceProps;
