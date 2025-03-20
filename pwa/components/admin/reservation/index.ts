import { ReservationsList } from "./ReservationsList";
import { ReservationsCreate } from "./ReservationsCreate";
import { ReservationsEdit } from "./ReservationsEdit";
import { ReservationShow } from "./ReservationShow";

const reservationResourceProps = {
  list: ReservationsList,
  create: ReservationsCreate,
  edit: ReservationsEdit,
  hasShow: false,
  show: ReservationShow
};

export default reservationResourceProps;
