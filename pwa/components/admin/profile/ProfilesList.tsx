import { Datagrid, List, CreateButton, ExportButton, TopToolbar, EditButton, ShowButton, SimpleList, FunctionField, useRecordContext } from "react-admin";
import { decimalToTimeFormatted, getFirstCharToUpperCase, getShipStyle, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { type PagedCollection } from "../../../types/collection";
import { type Circuit } from "../../../types/Circuit";
import { useMediaQuery, Theme, Button, Box, Typography } from '@mui/material';
import ClearIcon from'@mui/icons-material/Clear';
import DoneIcon from'@mui/icons-material/Done';
import Chip from '@mui/material/Chip';
import { type NextPage } from "next";
import React from 'react';
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useSessionContext } from "../SessionContextProvider";

export interface Props {
  data: PagedCollection<Circuit> | null;
  hubURL: string | null;
  page: number;
}

const CustomCSVButton = ({ isSmall, onClick }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => onClick()}
      startIcon={<BackupTableIcon className={`${isSmall && 'mb-3'}`}/>}
    >
      {!isSmall && 'EXPORT CSV'}
    </Button>
  );
};

const CustomPDFButton = ({ isSmall, onClick }) => {
  return (
    <Button
      size="small"
      color="primary"
      onClick={() => onClick()}
      startIcon={<PictureAsPdfIcon className={`${isSmall && 'mb-3'}`}/>}
    >
      {!isSmall && 'EXPORT PDF'}
    </Button>
  );
};

const ListActions = ({ isSmall, resource }) => { 
  const { session } = useSessionContext();

  const handleExport = async (format) => {

      const url = `/exports/${resource}?format=${format}`;
      const response = await fetch(url, {headers: {'Authorization': `Bearer ${session?.accessToken}`}});

      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = `${resource}.${format}`;
      a.click();
      window.URL.revokeObjectURL(blobUrl);
  };

  return (
    <TopToolbar>
      <CreateButton className={`${!isSmall && 'mb-[2px]'}`}/>
      <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/>
      <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/>
    </TopToolbar>
  );
};

const ClientsExpand = () => {
  const record = useRecordContext();
  const clients = record?.pilote?.clients;
  if (!clients?.length) return <Typography variant="body2" color="text.secondary" sx={{ p: 1 }}>Aucun client rattaché</Typography>;
  return (
    <Box sx={{ p: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
      {clients.map((c, i) => (
        <Chip
          key={c['@id'] || i}
          label={c.name}
          size="small"
          sx={{
            backgroundColor: c.color ? `${c.color}20` : '#e0e0e0',
            color: c.color || '#666',
            border: `1px solid ${c.color ? `${c.color}55` : '#ccc'}`,
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        />
      ))}
    </Box>
  );
};

export const ProfilesList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const getPilotQualifications = ({ pilotQualifications }) => isDefinedAndNotVoid(pilotQualifications) && <span className="text-right flex flex-end">{ pilotQualifications.map((q, i) => <Chip key={i} label={q.qualification.slug} size="small" sx={ getShipStyle(q.qualification, q.validUntil) }/>) }</span>
  const getFormattedPilotMedicalStatus = ({ availableCertificate }) => !isDefined(availableCertificate) ? <></> : <span className="mr-2">{ availableCertificate ? <span className="text-green-500"><DoneIcon/></span> : <span className="text-red-500"><ClearIcon/></span> }</span>
  const getPilotMedicalStatus =  ({ availableCertificate }) => !isDefined(availableCertificate) ? "" :  (availableCertificate ? <span className="text-green-500"><DoneIcon/></span> : <span className="text-red-500"><ClearIcon/></span>)
  const getPiloteName = ({ pilote }) => isDefined(pilote?.firstName) ? pilote.firstName.charAt(0).toUpperCase() + pilote.firstName.slice(1) : '';

  return (
    <List 
      resource="profil_pilotes" 
      actions={<ListActions isSmall={isSmall} resource="profil_pilotes"/>} 
      pagination={false}
    >
        { isSmall ? 
            <SimpleList
              primaryText={ record => <>{ getFormattedPilotMedicalStatus(record) }{ getPiloteName(record) }</> }
              secondaryText={ record => getPilotQualifications(record) }
              tertiaryText={record => !isDefined(record?.totalFlightHours) ? "00:00" :  decimalToTimeFormatted(record.totalFlightHours) }
            /> 
            : 
            <Datagrid expand={<ClientsExpand />} sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <FunctionField
                  label="Prénom"
                  source="pilote.firstName"
                  render={(record) => getFirstCharToUpperCase(record?.pilote?.firstName) }
                />
                <FunctionField
                  label="Total des heures de vol"
                  render={record => isDefined(record?.totalFlightHours) ? decimalToTimeFormatted(record.totalFlightHours) : "00:00"}
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