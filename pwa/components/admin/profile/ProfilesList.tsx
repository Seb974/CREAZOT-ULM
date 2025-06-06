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
} from "react-admin";
import Chip from '@mui/material/Chip';
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';
import { getShipStyle, isDefined } from "../../../app/lib/utils";

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

  const getPilotStatus = ({ qualifications }) => <span className="text-right flex flex-end">{ qualifications.map((q, i) => <Chip key={i} label={q.slug} size="small" sx={ getShipStyle(q) }/>) }</span>

  return (
    <List 
      resource="profil_pilotes" 
      actions={<ListActions/>} 
      pagination={false}
    >
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