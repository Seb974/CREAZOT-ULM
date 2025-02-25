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
import { type Vol } from "../../../types/Vol";
import { type PagedCollection } from "../../../types/collection";
import { ShowButton } from "./ShowButton";
import { RatingField } from "../review/RatingField";
import { ConditionInput } from "./ConditionInput";
import { type FiltersProps, buildUriFromFilters } from "../../../utils/book";

export interface Props {
  data: PagedCollection<Vol> | null;
  hubURL: string | null;
  page: number;
}

const getPagePath = (page: number): string => `/vols?page=${page}`;

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
      {/* <SelectColumnsButton />
      // <FilterButton/> */}
      <FilterButton/> 
      {/* <CreateButton/> */}
      <ExportButton/>
  </TopToolbar>
);

const filters = [
  // <TextInput source="prestation.aeronef.immatriculation" key="Aeronef" label="Aéronef"/>,
  <TextInput source="prestation.pilote.firstName" key="Pilote" label="Pilote" />,
  <TextInput source="circuit.code" key="Circuit" label="Circuit" />,
  <DateInput source="prestation.date[after]"  key="DateMin" label="Date Min"/>,
  <DateInput source="prestationdate[before]"  key="DateMax" label="Date Max"/>,
];

export const VolsList: NextPage<Props> = ({ data, hubURL, page }) => {
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
    <List resource="vols" actions={<ListActions/>} filters={ filters }>   {/* filter={{ authorId }} */} 
        <Datagrid>
            <DateField source="prestation.date" label="Date" sortable={ true }/>
            <NumberField source="quantite"/>
            <TextField source="circuit.code" label="Circuit" sortable={ true }/>
            <TextField source="prestation.pilote.firstName" label="Pilote" sortable={ true }/>
            <TextField source="option.nom" label="Option" sortable={ true }/>
            <NumberField source="prix" label="C.A."/>
        </Datagrid>
    </List>
  );
}