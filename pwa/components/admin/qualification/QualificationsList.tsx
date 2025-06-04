import { type NextPage } from "next";
import {
  Datagrid,
  List,
  FunctionField,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  ShowButton,
  BooleanField,
  SimpleList,
} from "react-admin";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { useMediaQuery, Theme } from '@mui/material';
import { colors, getColor } from '../../../app/lib/colors';
import { isDefined } from "../../../app/lib/utils";

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

export const QualificationsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));
  const getNameText = ({ nom, color }) => <span style={{ color: getColor(color).id }}>{ nom }</span>;
  const getEncadrantText = ({ encadrant }) => isDefined(encadrant) && encadrant ? <span className="text-sm italic">{ "Encadrant" }</span> : '';

  return (
    <List resource="qualifications" actions={<ListActions/>}>   
        { isSmall ? 
            <SimpleList
              primaryText={ record => getNameText(record) }
              secondaryText={ record => getEncadrantText(record) }
              linkType="edit"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <FunctionField
                    label="Qualification"
                    source="nom"
                    render={({ color, nom }) =>  <span style={{ color: getColor(color).id }}>{ nom }</span>
                    }
                />
                <BooleanField source="encadrant" label="Encadrant" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}