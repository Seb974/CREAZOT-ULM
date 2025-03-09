import { CircuitsList } from "./CircuitsList";
import { CircuitsCreate } from "./CircuitsCreate";
import { CircuitsEdit } from "./CircuitsEdit";
import { CircuitShow } from "./CircuitShow";
// import { type Vol } from "../../../types/Vol";

const circuitResourceProps = {
  list: CircuitsList,
  create: CircuitsCreate,
  edit: CircuitsEdit,
  hasShow: false,
  show: CircuitShow
  // recordRepresentation: (record: Prestation) => `${record.title} - ${record.author}`,
};

export default circuitResourceProps;
