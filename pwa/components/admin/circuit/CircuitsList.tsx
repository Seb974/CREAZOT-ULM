import { type NextPage } from "next";
import {
  TextInput,
  Datagrid,
  useRecordContext,
  List,
  TextField,
  WrapperField,
  CreateButton,
  DatagridConfigurable,
  ExportButton,
  FilterButton,
  SelectColumnsButton,
  TopToolbar,
  DateField,
  NumberField,
  DateInput,
  EditButton,
  ShowButton

  
} from "react-admin";

// import { useRouter } from "next/navigation";
// import { useMutation } from "@tanstack/react-query";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <FilterButton/> 
      <CreateButton/>
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

export const CircuitsList: NextPage<Props> = ({ data, hubURL, page }) => {
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
    <List resource="circuits" actions={<ListActions/>} filters={ filters }>   {/* filter={{ authorId }} */} 
        <Datagrid>
            <TextField source="code" label="Code" sortable={ true }/>
            <TextField source="nom" label="Nom" sortable={ true }/>
            <TextField source="nature.code" label="Nature" sortable={ true }/>
            <DateField source="duree" label="Durée" sortable={ false } showTime showDate={false}/>
            <NumberField source="prix" options={{ style: 'currency', currency: 'EUR' }} label="Prix"/>
            <ShowButton/>
            <EditButton />
        </Datagrid>
    </List>
  );
}