import { type NextPage } from "next";
import React from 'react';
import {
  Datagrid,
  List,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  ShowButton,
  SimpleList,
  FunctionField,
  BooleanField,
} from "react-admin";
import Chip from '@mui/material/Chip';
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';
import { getShipStyle, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AlarmOffIcon from '@mui/icons-material/AlarmOff';
import DoneIcon from'@mui/icons-material/Done';
import ClearIcon from'@mui/icons-material/Clear';

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const ListActions = () => (
  <TopToolbar>
      <CreateButton/>
      <ExportButton/>
  </TopToolbar>
);

export const ProfilesList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const getPilotStatus = ({ pilotQualifications }) => isDefinedAndNotVoid(pilotQualifications) && <span className="text-right flex flex-end">{ pilotQualifications.map((q, i) => <Chip key={i} label={q.qualification.slug} size="small" sx={ getShipStyle(q.qualification, q.validUntil) }/>) }</span>

  return (
    <List 
      resource="profil_pilotes" 
      actions={<ListActions/>} 
      pagination={false}
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => isDefined(record.pilote) && isDefined(record.pilote.firstName) ? record.pilote.firstName.charAt(0).toUpperCase() + record.pilote.firstName.slice(1) : '' }
              tertiaryText={record => !isDefined(record?.availableCertificate) ? "" :  (record?.availableCertificate ? <span className="text-green-500"><DoneIcon/></span> : <span className="text-red-500"><ClearIcon/></span>)}
              secondaryText={ record => getPilotStatus(record) }
              // tertiaryText
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
                  render={record => record.pilotQualifications?.map((q, i) => <Chip key={i} label={q.qualification.slug} size="small" sx={ getShipStyle(q.qualification, q.validUntil) }/>)}
                />
                <FunctionField
                  label="Certificat médical à jour"
                  textAlign="center"
                  render={record => !isDefined(record?.availableCertificate) ? "" :  (record?.availableCertificate ? <span className="text-green-500"><DoneIcon/></span> : <span className="text-red-500"><ClearIcon/></span>)}
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