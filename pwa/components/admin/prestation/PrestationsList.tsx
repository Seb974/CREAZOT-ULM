
import { type NextPage } from "next";
import { FieldGuesser } from "@api-platform/admin";
import {
  TextInput,
  Datagrid,
  useRecordContext,
  List,
  TextField,
  EditButton,
  WrapperField,
  CreateButton,
  DatagridConfigurable,
  ExportButton,
  FilterButton,
  SelectColumnsButton,
  TopToolbar,
  SearchInput,
  DateField,
  NumberField,
  DateInput,
} from "react-admin";

import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { useMercure } from "../../../utils/mercure";
import { type Prestation } from "../../../types/Prestation";
import { type PagedCollection } from "../../../types/collection";
import { ShowButton } from "./ShowButton";
import { RatingField } from "../review/RatingField";
import { ConditionInput } from "./ConditionInput";
import { type FiltersProps, buildUriFromFilters } from "../../../utils/book";

export interface Props {
  data: PagedCollection<Prestation> | null;
  hubURL: string | null;
  page: number;
}

const getPagePath = (page: number): string => `/prestations?page=${page}`;

const ConditionField = () => {
  const record = useRecordContext();
  if (!record || !record.condition) return null;
  return (
    <span>
      {record.condition.replace(/https:\/\/schema\.org\/(.+)Condition$/, "$1")}
    </span>
  );
};

const ListActions = () => (
  <TopToolbar>
      <FilterButton/> 
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

const filters = [
  <TextInput source="aeronef.immatriculation" key="Aeronef" label="Aéronef"/>,
  <TextInput source="pilote.firstName" key="Pilote" label="Pilote" />,
  <DateInput source="date[after]"  key="DateMin" label="Date Min"/>,
  <DateInput source="date[before]"  key="DateMax" label="Date Max"/>,
];

export const PrestationsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const collection = useMercure(data, hubURL);
  // const router = useRouter();

  // const filtersMutation = useMutation({
  //   mutationFn: async (filters: FiltersProps) => {
  //     router.push(buildUriFromFilters("/books", filters));
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //   },
  // });


  return (
    <List resource="prestations" actions={<ListActions/>} filters={ filters }>   {/* filter={{ authorId }} */} 
        <Datagrid>
            <TextField source="aeronef.immatriculation" label="Aéronef" sortable={ true }/>
            <DateField source="date" sortable={ true }/>
            <TextField source="pilote.firstName" label="Pilote" sortable={ true }/>
            <NumberField source="horametreDepart"/>
            <NumberField source="duree" label="Durée"/>
            <NumberField source="horametreFin"/>


        </Datagrid>
    </List>
  );
}

