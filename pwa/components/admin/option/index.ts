import { OptionsList } from "./OptionsList";
import { OptionsCreate } from "./OptionsCreate";
import { OptionsEdit } from "./OptionsEdit";
import { OptionShow } from "./OptionShow";

const optionResourceProps = {
  list: OptionsList,
  create: OptionsCreate,
  edit: OptionsEdit,
  hasShow: false,
  show: OptionShow
};

export default optionResourceProps;
