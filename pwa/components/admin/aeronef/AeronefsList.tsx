import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  ExportButton,
  FilterButton,
  TopToolbar,
  DateField,
  NumberField,
  EditButton,
  ShowButton,
  BooleanField,
  FunctionField
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
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

export const AeronefsList: NextPage<Props> = ({ data, hubURL, page }) => {

  const collection = useMercure(data, hubURL);

  const getDecimalTimeFromLocale = timeToFormat => Math.trunc(timeToFormat) + (timeToFormat - Math.trunc(timeToFormat)) / 60 * 100;

  const getRemainingTime = record => record.decimal ? getRemainingDecimalTime(record) : getRemainingLocaleTime(record);

  const getRemainingLocaleTime = ({entretien, horametre, seuilAlerte}) => getRemainingDecimalTime({entretien : getDecimalTimeFromLocale(entretien), horametre: getDecimalTimeFromLocale(horametre), seuilAlerte});
  
  const getRemainingDecimalTime = ({entretien, horametre, seuilAlerte}) => {
      const alerte = isDefined(seuilAlerte) ? seuilAlerte : 10;
      const remainingDecimalTime = entretien - horametre;
      const sign = remainingDecimalTime > 0 ? "" : "+ ";
      const intRemainingTime = Math.abs(Math.trunc(remainingDecimalTime));
      const rest = Math.round((Math.abs(remainingDecimalTime) - intRemainingTime) * 60);
      const formattedRest = rest < 10 ? "0" + rest.toFixed(0) : rest.toFixed(0);
      return (
          <p className={`${ (entretien - alerte) - horametre > 0 ? 'font-normal' : 'font-bold'} 
                          ${ (entretien - alerte) - horametre < 0 ? (horametre > entretien ? 'text-red-500' : 'text-orange-500') : 'text-green-500'}`}>
              { sign + intRemainingTime + "h" + formattedRest }
          </p>
      );
  };

  return (
    <List resource="aeronefs" actions={<ListActions/>}>
        <Datagrid sx={{ '& .RaDatagrid-headerCell': {backgroundColor: '#ededed', fontWeight: "lighter"}}}>
            <TextField source="immatriculation" label="Immatriculation" sortable={ true }/>
            <NumberField source="horametre" options={{ style: 'unit', unit: 'hour' }} label="Horamètre"/>
            <FunctionField
              source="entretien"
              label="Temps de vol avant entretien"
              textAlign="right"
              render={ record => <>{ getRemainingTime(record) }</> }
            />
            <p className="text-right">
                <ShowButton />
                <EditButton />
            </p>
        </Datagrid>
    </List>
  );
}