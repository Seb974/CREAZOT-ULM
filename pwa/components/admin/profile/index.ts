import { ProfilesList } from "./ProfilesList";
import { ProfilesCreate } from "./ProfilesCreate";
import { ProfilesEdit } from "./ProfilesEdit";
import { ProfileShow } from "./ProfileShow";

const profileResourceProps = {
  list: ProfilesList,
  create: ProfilesCreate,
  edit: ProfilesEdit,
  hasShow: false,
  show: ProfileShow
};

export default profileResourceProps;
