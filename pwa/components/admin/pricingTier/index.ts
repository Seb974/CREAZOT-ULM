import { PricingTiersList } from "./PricingTiersList";
import { PricingTiersCreate } from "./PricingTiersCreate";
import { PricingTiersEdit } from "./PricingTiersEdit";

const pricingTierResourceProps = {
  list: PricingTiersList,
  create: PricingTiersCreate,
  edit: PricingTiersEdit,
  hasShow: false,
};

export default pricingTierResourceProps;
