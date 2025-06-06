import { PaymentsList } from "./PaymentsList";
import { PaymentsCreate } from "./PaymentsCreate";
import { PaymentsEdit } from "./PaymentsEdit";
import { PaymentShow } from "./PaymentShow";

const paymentResourceProps = {
  list: PaymentsList,
  create: PaymentsCreate,
  edit: PaymentsEdit,
  hasShow: false,
  show: PaymentShow
};

export default paymentResourceProps;
