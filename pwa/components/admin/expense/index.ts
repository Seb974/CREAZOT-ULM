import { ExpensesList } from "./ExpensesList";
import { ExpensesCreate } from "./ExpensesCreate";
import { ExpensesEdit } from "./ExpensesEdit";
import { ExpenseShow } from "./ExpenseShow";

const expenseResourceProps = {
  list: ExpensesList,
  create: ExpensesCreate,
  edit: ExpensesEdit,
  hasShow: false,
  show: ExpenseShow
};

export default expenseResourceProps;
