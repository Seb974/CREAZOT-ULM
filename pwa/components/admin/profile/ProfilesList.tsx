import { Datagrid, List, CreateButton, ExportButton, TopToolbar, EditButton, ShowButton, SimpleList, FunctionField } from "react-admin";
import { decimalToTime, getShipStyle, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { type PagedCollection } from "../../../types/collection";
import { type Circuit } from "../../../types/Circuit";
import { useMediaQuery, Theme } from '@mui/material';
import ClearIcon from'@mui/icons-material/Clear';
import DoneIcon from'@mui/icons-material/Done';
import Chip from '@mui/material/Chip';
import { type NextPage } from "next";
import React from 'react';

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

  const getPilotQualifications = ({ pilotQualifications }) => isDefinedAndNotVoid(pilotQualifications) && <span className="text-right flex flex-end">{ pilotQualifications.map((q, i) => <Chip key={i} label={q.qualification.slug} size="small" sx={ getShipStyle(q.qualification, q.validUntil) }/>) }</span>
  const getFormattedPilotMedicalStatus = ({ availableCertificate }) => !isDefined(availableCertificate) ? <></> : <span className="mr-2">{ availableCertificate ? <span className="text-green-500"><DoneIcon/></span> : <span className="text-red-500"><ClearIcon/></span> }</span>
  const getPilotMedicalStatus =  ({ availableCertificate }) => !isDefined(availableCertificate) ? "" :  (availableCertificate ? <span className="text-green-500"><DoneIcon/></span> : <span className="text-red-500"><ClearIcon/></span>)
  const getPiloteName = ({ pilote }) => isDefined(pilote?.firstName) ? pilote.firstName.charAt(0).toUpperCase() + pilote.firstName.slice(1) : '';

  return (
    <List 
      resource="profil_pilotes" 
      actions={<ListActions/>} 
      pagination={false}
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => <>{ getFormattedPilotMedicalStatus(record) }{ getPiloteName(record) }</> }
              secondaryText={ record => getPilotQualifications(record) }
              tertiaryText={record => !isDefined(record?.totalFlightHours) ? "00:00" :  decimalToTime(record.totalFlightHours) }
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
                  label="Total des heures de vol"
                  render={record => isDefined(record?.totalFlightHours) ? decimalToTime(record.totalFlightHours) : "00:00"}
                  textAlign="center"
                />
                <FunctionField
                  label="Qualifications"
                  render={record => record.pilotQualifications?.map((q, i) => <Chip key={i} label={q.qualification.slug} size="small" sx={ getShipStyle(q.qualification, q.validUntil) }/>)}
                />
                <FunctionField
                  label="Certificat médical à jour"
                  textAlign="center"
                  render={record => getPilotMedicalStatus(record)}
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