import { AirportsList } from "./AirportsList";
import { AirportsCreate } from "./AirportsCreate";
import { AirportsEdit } from "./AirportsEdit";
import { AirportShow } from "./AirportShow";

const airportResourceProps = {
  list: AirportsList,
  create: AirportsCreate,
  edit: AirportsEdit,
  hasShow: false,
  show: AirportShow
};

export default airportResourceProps;
