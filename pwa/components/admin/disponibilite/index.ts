import { DisponibilitesList } from "./DisponibilitesList";
import { DisponiblitesCreate } from "./DisponiblitesCreate";
import { DisponibilitesEdit } from "./DisponibilitesEdit";
import { DisponibiliteShow } from "./DisponibiliteShow";

const disponibiliteResourceProps = {
  list: DisponibilitesList,
  create: DisponiblitesCreate,
  edit: DisponibilitesEdit,
  hasShow: false,
  show: DisponibiliteShow
};

export default disponibiliteResourceProps;
