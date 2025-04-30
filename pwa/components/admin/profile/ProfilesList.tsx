import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextInput,
  BooleanInput,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  ShowButton,
  SimpleList,
  FunctionField,
  FilterButton
} from "react-admin";
import Chip from '@mui/material/Chip';
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

  const getShipStyle = ({ color }) => ({
    backgroundColor: color + '33',
    color: color,
    border: '1px solid',
    borderColor: color,
    marginRight: '4px',
    marginBottom: '2px',
    marginTop: '2px'
  })

  const getPilotStatus = ({ qualifications }) => <span className="text-right flex flex-end">{ qualifications.map((q, i) => <Chip key={i} label={q.slug} size="small" sx={ getShipStyle(q) }/>) }</span>

  return (
    <List resource="profil_pilotes" actions={<ListActions/>} filters={ filters } pagination={false}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => isDefined(record.pilote) && isDefined(record.pilote.firstName) ? record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : '' }
              tertiaryText={ record => getPilotStatus(record) }
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
                  render={record => record.qualifications?.map((q, i) => <Chip key={i} label={q.slug} size="small" sx={ getShipStyle(q) }/>)}
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