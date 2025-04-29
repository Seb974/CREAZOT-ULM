import { QualificationsList } from "./QualificationsList";
import { QualificationsCreate } from "./QualificationsCreate";
import { QualificationsEdit } from "./QualificationsEdit";
import { QualificationShow } from "./QualificationShow";

const qualificationResourceProps = {
  list: QualificationsList,
  create: QualificationsCreate,
  edit: QualificationsEdit,
  hasShow: false,
  show: QualificationShow
};

export default qualificationResourceProps;
