import { CarnetVolsList } from "./CarnetVolsList";
import { CarnetVolsCreate } from "./CarnetVolsCreate";
import { CarnetVolsEdit } from "./CarnetVolsEdit";
import { CarnetVolShow } from "./CarnetVolShow";

const carnetVolResourceProps = {
  list: CarnetVolsList,
  create: CarnetVolsCreate,
  edit: CarnetVolsEdit,
  hasShow: false,
  show: CarnetVolShow
};

export default carnetVolResourceProps;
