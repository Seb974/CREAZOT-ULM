import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  TopToolbar,
  NumberField,
  EditButton,
  ShowButton,
  SimpleList,
  FunctionField
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { isDefined } from "../../../app/lib/utils";
import { useMediaQuery, Theme } from '@mui/material';

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

export const AeronefsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const collection = useMercure(data, hubURL);
  const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const getDecimalTimeFromLocale = timeToFormat => Math.trunc(timeToFormat) + (timeToFormat - Math.trunc(timeToFormat)) / 60 * 100;

  const getRemainingTime = record => record.decimal ? getRemainingDecimalTime(record) : getRemainingLocaleTime(record);

  const getRemainingMotorTime = record => record.decimal ? getRemainingDecimalTime({entretien: record.changementMoteur, horametre: record.horametre, seuilAlerte: record.seuilAlerteChangementMoteur}) : getRemainingMotorLocaleTime(record);

  const getRemainingLocaleTime = ({entretien, horametre, seuilAlerte}) => getRemainingDecimalTime({entretien : getDecimalTimeFromLocale(entretien), horametre: getDecimalTimeFromLocale(horametre), seuilAlerte});

  const getRemainingMotorLocaleTime = ({changementMoteur, horametre, seuilAlerteChangementMoteur}) => getRemainingDecimalTime({entretien : getDecimalTimeFromLocale(changementMoteur), horametre: getDecimalTimeFromLocale(horametre), seuilAlerte: seuilAlerteChangementMoteur});
  
  const getRemainingDecimalTime = ({entretien, horametre, seuilAlerte}) => {
      const alerte = isDefined(seuilAlerte) ? seuilAlerte : 10;
      const remainingDecimalTime = entretien - horametre;
      const sign = remainingDecimalTime > 0 ? "" : "+ ";
      const intRemainingTime = Math.abs(Math.trunc(remainingDecimalTime));
      const rest = Math.round((Math.abs(remainingDecimalTime) - intRemainingTime) * 60);
      const formattedRest = !isNaN(rest) ? rest < 10 ? "0" + rest.toFixed(0) : rest.toFixed(0) : "-";
      return (
          <p className={`${ (entretien - alerte) - horametre > 0 ? 'font-normal' : 'font-bold'} 
                          ${ (entretien - alerte) - horametre < 0 ? (horametre > entretien ? 'text-red-500' : 'text-orange-500') : 'text-green-500'}`}>
              { (!isNaN(intRemainingTime) ? (sign + intRemainingTime + "h") : "") + formattedRest }
          </p>
      );
  };

  return (
    <List resource="aeronefs" actions={<ListActions/>}>
        { isSmall ? 
            <SimpleList
              primaryText={ record => record.immatriculation }
              secondaryText={ record => record.horametre + 'h' }
              tertiaryText={ record => getRemainingTime(record) }
              linkType="show"
            /> 
            : 
            <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
                <TextField source="immatriculation" label="Immatriculation" sortable={ true }/>
                <NumberField source="horametre" options={{ style: 'unit', unit: 'hour' }} label="Horamètre"/>
                <FunctionField
                  source="entretien"
                  label="Entretien"
                  textAlign="right"
                  render={ record => <>{ getRemainingTime(record) }</> }
                />
                <FunctionField
                  source="changementMoteur"
                  label="Changement moteur"
                  textAlign="right"
                  render={ record => <>{ getRemainingMotorTime(record) }</> }
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