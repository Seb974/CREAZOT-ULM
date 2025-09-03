import { type NextPage } from "next";
import {
  Datagrid,
  List,
  TextField,
  CreateButton,
  TopToolbar,
  NumberField,
  EditButton,
  ShowButton,
  SimpleList,
  FunctionField,
  useListContext
} from "react-admin";
import { useMercure } from "../../../utils/mercure";
import { type Circuit } from "../../../types/Circuit";
import { type PagedCollection } from "../../../types/collection";
import { isDefined } from "../../../app/lib/utils";
import { useMediaQuery, Theme, Button } from '@mui/material';
import { useSessionContext } from "../SessionContextProvider";
import BackupTableIcon from '@mui/icons-material/BackupTable';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ToggleAvailabilityButton from "./ToggleAvailabilityButton";

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

const ListActions = ({ resource, isSmall }) => {

  const { filterValues } = useListContext();
  const { session } = useSessionContext();
  const params = new URLSearchParams();

  Object.entries(filterValues).forEach(([key, value]) => {
      // @ts-ignore
      if (value && typeof value === 'object' && value.after) {
          // @ts-ignore
          if (value.after) params.append(`${key}[after]`, value.after);
          // @ts-ignore
          if (value.before) params.append(`${key}[before]`, value.before);
      } else if (value != null) {
          // @ts-ignore
          params.append(key, value);
      }
  });

  const handleExport = async (format) => {

      const url = `/exports/${resource}?${params.toString()}&format=${format}`;
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
        <CreateButton/>
        <CustomCSVButton onClick={ () => handleExport('csv') } isSmall={isSmall}/>
        <CustomPDFButton onClick={ () => handleExport('pdf') } isSmall={isSmall}/>
    </TopToolbar>
  )
};

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
    <List resource="aeronefs" actions={<ListActions resource="aeronefs" isSmall={isSmall}/>}>
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
                <ToggleAvailabilityButton label="Disponibilité" textAlign="center"/>
                <p className="text-right">
                    <ShowButton />
                    <EditButton />
                </p>
            </Datagrid>
        }
    </List>
  );
}