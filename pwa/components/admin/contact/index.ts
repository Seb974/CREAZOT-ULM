import { ContactsList } from "./ContactsList";
import { ContactsCreate } from "./ContactsCreate";
import { ContactsEdit } from "./ContactsEdit";
import { ContactShow } from "./ContactShow";

const contactResourceProps = {
  list: ContactsList,
  create: ContactsCreate,
  edit: ContactsEdit,
  hasShow: false,
  show: ContactShow
};

export default contactResourceProps;
