import { 
  Edit, 
  SelectInput, 
  useDataProvider,
  DateTimeInput, 
  ReferenceInput, 
  SimpleForm, 
  TextInput,
  NumberInput,
  BooleanInput
} from "react-admin";
import { isDefined } from "../../../app/lib/utils";
import { useEffect, useState } from "react";

export const ReservationsEdit = () => {

  const dataProvider = useDataProvider();
  const [circuits, setCircuits] = useState([]);
  const [options, setOptions] = useState([]);
  
  const status = [
    {id: "VALIDATED", name: "Validé"},
    {id: "WAITING", name: "En attente de confirmation"},
    {id: "WHEATER_CANCEL", name:"Annulation météo"},
    {id: "PASSENGER_CANCEL", name: "Annulation client"},
    {id: "INTERN_CANCEL", name: "Annulation interne"}
  ];

  useEffect(() => {
    getCircuits();
    getOptions();
  }, []);

  const getCircuits = () => {
    dataProvider
      .getList("circuits", {})
      .then(({ data }) => setCircuits(data));
  };

  const getOptions = () => {
    dataProvider
      .getList("options", {})
      .then(({ data }) => setOptions(data));
  };

  const transform = ({circuit, option, debut, avion, pilote, ...data}) => {
    const selectedCircuit = isDefined(circuit) && isDefined(circuit['@id']) ? circuits.find(c => c['@id'] === circuit['@id']) : null;
    const selectedOption = isDefined(option) && isDefined(option['@id']) ? options.find(c => c['@id'] === option['@id']) : null;
    return {...data,
    fin: getEnd(debut, selectedCircuit),
    prix: getTotalPrice(selectedCircuit, selectedOption),
    circuit: isDefined(circuit) ? circuit['@id'] : null,
    avion: isDefined(avion) ? avion['@id'] : null,
    option: isDefined(option) ? option['@id'] : null,
    pilote: isDefined(pilote) ? pilote['@id'] : null
    }
  };

  const getTotalPrice = (circuit, option) => {
    return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
  };

  const getEnd = (debut, circuit) => {
    const start = new Date(debut);
    const duration = isDefined(circuit) && isDefined(circuit.duree) ? new Date(circuit.duree) : new Date((new Date()).setHours(1, 0, 0));
    return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
  };

  return (
  <Edit transform={transform}>
      <SimpleForm>
          <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(8, 0, 0)) } label="Date"/>
          <TextInput source="nom" label="Nom & prénom du passager"/>
          <TextInput source="telephone" label="N° de téléphone"/>
          <TextInput source="email" label="Adresse email"/>
          <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
          <ReferenceInput reference="options" source="option.@id" label="Option" />
          <ReferenceInput reference="users" source="pilote.@id" label="Pilote" />
          <ReferenceInput reference="aeronefs" source="avion.@id" label="Aéronef" />
          <SelectInput source="statut" choices={ status} />
          <TextInput source="color" label="Code couleur"/>
          <TextInput source="remarques" label="Remarques" multiline/>
          <BooleanInput source="report" label="Report"/>
      </SimpleForm>
  </Edit>
  )
};