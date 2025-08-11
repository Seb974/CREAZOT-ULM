import { CircuitsList } from "./CircuitsList";
import { CircuitsCreate } from "./CircuitsCreate";
import { CircuitsEdit } from "./CircuitsEdit";
import { CircuitShow } from "./CircuitShow";

const circuitResourceProps = {
  list: CircuitsList,
  create: CircuitsCreate,
  edit: CircuitsEdit,
  hasShow: false,
  show: CircuitShow
};

export default circuitResourceProps;
