import { UsersList } from "./UsersList";
import { UserShow } from "./UserShow";
import { UserEdit } from "./UserEdit";

const userResourceProps = {
  list: UsersList,
  hasShow: false,
  show: UserShow,
  edit: UserEdit,
};

export default userResourceProps;
