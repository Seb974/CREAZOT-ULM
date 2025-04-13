import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  SelectInput,
  Create,
  required,
  useDataProvider,
  ArrayInput,
  SimpleFormIterator,
  BooleanInput,
  useCreate,
  useRedirect,
  useNotify
} from "react-admin";
import { getRandomColor, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';

export const ReservationsCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const dataProvider = useDataProvider();
  const [circuits, setCircuits] = useState([]);
  const [origines, setOrigines] = useState([]);

  const status = [
    {id: "VALIDATED", name: "Validé"},
    {id: "WAITING", name: "En attente de confirmation"},
    {id: "WHEATER_REPORT", name:"Report météo"},
    {id: "PASSENGER_REPORT", name: "Report client"},
    {id: "INTERN_REPORT", name: "Report interne"},
    {id: "WHEATER_CANCEL", name:"Annulation météo"},
    {id: "PASSENGER_CANCEL", name: "Annulation client"},
    {id: "INTERN_CANCEL", name: "Annulation interne"}
  ];

  useEffect(() => {
      getCircuits();
      getOrigines();
  }, []);

  const getCircuits = () => {
    dataProvider
        .getList("circuits", {})
        .then(({ data }) => setCircuits(data));
  };

  const getOrigines = () => {
    dataProvider
        .getList("origines", {})
        .then(({ data }) => setOrigines(data));
  };
    
  const onSubmit = async data => {
    try {
      const selectedCircuit = circuits.find(c => c['@id'] === data.circuit);
      const selectedOrigines = isDefinedAndNotVoid(data.origine) ? origines.filter(origine => isDefined(data.origine.find(o => origine['@id'] === o['@id']))) : [];
      data = {
        ...data, 
        remarques: isDefined(data.remarques) ? data.remarques : '', 
        prix: getTotalPrice(selectedCircuit, null, selectedOrigines), 
        fin: getEnd(data.debut, selectedCircuit),
        color: getRandomColor(),
        report: false,
        contact: isDefinedAndNotVoid(data.contact) ? data.contact.map(c => c['@id']) : [],
        origine: isDefinedAndNotVoid(data.origine) ? data.origine.map(o => o['@id']) : []
      };
      for (let i = 0; i < data.quantite; i++) {
        if (i < data.quantite - 1)
          create('reservations', { data });
        else
          await create('reservations', { data });
      }
      notify('La réservation a bien été enregistrée.', { type: 'info' });
      redirect('list', 'reservations');
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement de la réservation.`, { type: 'error' });
      redirect('list', 'reservations');
      console.log(error);
    }
  };

  const getTotalPrice = (circuit, option, origines) => {
      const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
      return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
  };
        
  const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  const getEnd = (debut, circuit) => {
    const start = new Date(debut);
    const duration = new Date(circuit.duree);
    return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
  };

  return (
    <Create redirect="list">
      <SimpleForm onSubmit={ onSubmit }>    {/* noValidate */}
        <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(7,0,0)) } label="Décollage" validate={required()}/>
        <TextInput source="nom" label="Nom & prénom du passager" validate={required()}/>   {/* validate={required()} */}
        <TextInput source="telephone" label="N° de téléphone" validate={required()}/>
        <TextInput source="email" label="Adresse email"/>
        <NumberInput source="quantite" label="Nombre de passager(s)" defaultValue={ 1 } validate={required()}/>
        <ReferenceInput reference="circuits" source="circuit" label="Circuit"/>
        <SelectInput source="statut" choices={ status } defaultValue={ status[0].id } validate={required()}/>
        <ArrayInput source="contact" label="Contact initial">
          <SimpleFormIterator inline disableReordering>
              <ReferenceInput reference="contacts" source="@id" label="Contact initial" />
          </SimpleFormIterator>
        </ArrayInput>
        <ArrayInput source="origine" label="Origine de l'appel">
          <SimpleFormIterator inline disableReordering>
              <ReferenceInput reference="origines" source="@id" label="Origine de l'appel" />
          </SimpleFormIterator>
        </ArrayInput>
        <TextInput source="remarques" label="Remarques" multiline sx={{ '& .MuiInputBase-inputMultiline': {height: '200px!important'} }}/>
        <BooleanInput source="paid" label="Prépayé"/>
        <BooleanInput source="upsell" label="Upsell"/>
        <BooleanInput source="report" label="Report"/>
      </SimpleForm>
    </Create>
  ) ;
}