import { 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  DateInput,
  BooleanInput,
  useDataProvider,
  ReferenceArrayInput
} from "react-admin";
import { Create } from "react-admin";
import { useEffect, useState } from "react";
import { useWatch, useFormContext } from 'react-hook-form';
import { isDefined } from "../../../app/lib/utils";

const AeronefWatcher = ({ setSelectedAeronef, setIsChangementMoteur }) => {
  const dataProvider = useDataProvider();
  const { control, setValue } = useFormContext();
  const [aeronefs, setAeronefs] = useState([]);

  const aeronef = useWatch({ control, name: 'aeronef', defaultValue: null });
  const changementMoteur = useWatch({ control, name: 'changementMoteur', defaultValue: false});

  useEffect(() => getAeronefs(), []);
  useEffect(() => setIsChangementMoteur(changementMoteur), [changementMoteur, setIsChangementMoteur]);

  useEffect(() => {
    if (isDefined(aeronef)) {
      const selection = aeronefs.find(a => a['@id'] === (typeof aeronef === 'string' ? aeronef : aeronef['@id']));
      setSelectedAeronef(selection);

      if (selection && selection.id) {
        const nextValue = !changementMoteur ? selection.entretien : selection.changementMoteur;
        setValue('horametreNextIntervention', nextValue ?? '');
      }
      return;
    }
    setSelectedAeronef(aeronef);
  }, [aeronef, changementMoteur, aeronefs, setSelectedAeronef, setValue]);

  const getAeronefs = () => {
    dataProvider
        .getList("aeronefs", {})
        .then(({ data }) => setAeronefs(data));
  };

  return null;
};

export const EntretiensCreate = () => {

  const [selectedAeronef, setSelectedAeronef] = useState(null);
  const [isChangementMoteur, setIsChangementMoteur] = useState(null);

  return (
    <Create redirect="list">
      <SimpleForm>
        <DateInput source="date" defaultValue={ new Date() } label="Date"/>
        <ReferenceInput reference="aeronefs" source="aeronef" label="Aéronef" />
        <ReferenceArrayInput source="intervenants" reference="users" />
        <TextInput source="intervention" label="Détail de l'intervention" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="changementMoteur" label="Changement du moteur" defaultValue={ false }/>
        <NumberInput key={ isDefined(selectedAeronef) ? selectedAeronef.id : 0 } source="horametreNextIntervention" label="Prochaine intervention"/>
        <AeronefWatcher setSelectedAeronef={ setSelectedAeronef } setIsChangementMoteur={ setIsChangementMoteur }/>
      </SimpleForm>
    </Create>
  );
};