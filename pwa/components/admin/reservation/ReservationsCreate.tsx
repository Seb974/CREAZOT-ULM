import { 
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  SelectInput,
  useCreate,
  Create,
  required,
  useDataProvider
} from "react-admin";
import { getRandomColor, isDefined } from "../../../app/lib/utils";
import { useEffect, useState } from "react";
import { toast } from 'react-hot-toast';

export const ReservationsCreate = () => {


  const [create] = useCreate();
  const dataProvider = useDataProvider();
  const [circuits, setCircuits] = useState([]);

  const status = [
    {id: "VALIDATED", name: "Validé"},
    {id: "WAITING", name: "En attente de confirmation"},
    {id: "WHEATER_CANCEL", name:"Annulation météo"},
    {id: "PASSENGER_CANCEL", name: "Annulation client"},
    {id: "INTERN_CANCEL", name: "Annulation interne"}
  ];

  useEffect(() => {
    dataProvider
      .getList("circuits", {})
      .then(({ data }) => setCircuits(data));
  }, []);
    
  const onSubmit = async data => {
    try {
      const selectedCircuit = circuits.find(c => c['@id'] === data.circuit);
      data = {
        ...data, 
        remarques: isDefined(data.remarques) ? data.remarques : '', 
        prix: getTotalPrice(selectedCircuit, null), 
        fin: getEnd(data.debut, selectedCircuit),
        color: getRandomColor(),
        report: false,
      };
      for (let i = 0; i < data.quantite; i++) {
        if (i < data.quantite - 1)
          create('reservations', { data });
        else
          await create('reservations', { data });
      }
      toast.success(`La réservation a bien été enregistrée.`, {duration: 1500});
    } catch (error) {
      toast.error('Une erreur bloque l\'enregistrement de la réservation.', {duration: 3000});
      console.log(error);
    }
  };

  const getTotalPrice = (circuit, option) => {
    return circuit.prix + (isDefined(option) ? option.prix : 0);
  };

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
        <TextInput source="telephone" label="N° de téléphone"validate={required()}/>
        <NumberInput source="quantite" label="Nombre de passager(s)" defaultValue={ 1 } validate={required()}/>
        <ReferenceInput reference="circuits" source="circuit" label="Circuit"/>
        <SelectInput source="statut" choices={ status } defaultValue={ status[0].id } validate={required()}/>
        <TextInput source="remarques" label="Remarques" multiline/>
      </SimpleForm>
    </Create>
  ) ;
}