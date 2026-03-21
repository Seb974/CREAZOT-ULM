import { PricingCategoriesList } from "./PricingCategoriesList";
import { PricingCategoriesCreate } from "./PricingCategoriesCreate";
import { PricingCategoriesEdit } from "./PricingCategoriesEdit";

const pricingCategoryResourceProps = {
  list: PricingCategoriesList,
  create: PricingCategoriesCreate,
  edit: PricingCategoriesEdit,
  hasShow: false,
};

export default pricingCategoryResourceProps;
