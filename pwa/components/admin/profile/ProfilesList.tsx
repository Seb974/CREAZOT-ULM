import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextInput,
  TextField,
  BooleanInput,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
  FunctionField,
  FilterButton
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';
import { isDefined } from "../../../app/lib/utils";

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
  <TextInput source="pilote.firstName" key="pilote" label="Pilote"/>,
  <BooleanInput source="isEleve" key="isEleve" label="En formation"/>,
  <BooleanInput source="isPro" key="isPro" label="Professionnel"/>,
  <BooleanInput source="isInstructeur" key="isInstructeur" label="Instructeur"/>
];

export const ProfilesList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  // const getPilotStatus = ({ isEleve, isPro, isInstructeur }) => {
  //     return isInstructeur ? <span className="text-red-600">{'Instructeur'}</span> : 
  //            isPro ? <span className="text-amber-600">{'Professionnel'}</span> : 
  //            isEleve ? <span className="text-sky-600">{'En formation'}</span> : 
  //            <span className="text-lime-600">{'Pilote de loisir'}</span>;
  // };

  const getPilotStatus = ({ qualifications }) => <span className="text-sm italic">{ qualifications.map((q, i) => q.nom + (i < (qualifications.length - 1) ? ' - ' : ' ')) }</span>

  return (
    <List resource="profil_pilotes" actions={<ListActions/>} filters={ filters }>
        { isSmall ? 
            <SimpleList
              primaryText={ record => isDefined(record.pilote) && isDefined(record.pilote.firstName) ? record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : '' }
              secondaryText={ record => getPilotStatus(record) }
              linkType="edit"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <FunctionField
                  label="Prénom"
                  source="pilote.firstName"
                  render={(record) => isDefined(record.pilote) && isDefined(record.pilote.firstName) ?
                    record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : ''
                  }
                />
                <FunctionField
                  label="Qualifications"
                  source="qualifications"
                  render={(record) => <span className="text-sm italic">{ record.qualifications.map((q, i) => q.nom + (i < (record.qualifications.length - 1) ? ' - ' : ' ')) }</span>}
                />
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}