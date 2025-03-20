import { DateInput, Edit, SelectInput, useDataProvider } from "react-admin";
import { 
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
  const [aeronefs, setAeronefs] = useState([]);
  const [options, setOptions] = useState([]);
  const [users, setUsers] = useState([]);
  
  const status = [
    {id: "VALIDATED", name: "Validé"},
    {id: "WAITING", name: "En attente de confirmation"},
    {id: "WHEATER_CANCEL", name:"Annulation météo"},
    {id: "PASSENGER_CANCEL", name: "Annulation client"},
    {id: "INTERN_CANCEL", name: "Annulation interne"}
  ];

  useEffect(() => {
    // getCircuits();
    // getAeronefs();
    // getOptions();
    // getUsers();
  }, []);

  const getCircuits = () => {
    dataProvider
      .getList("circuits", {})
      .then(({ data }) => setCircuits(data));
  };

  const getAeronefs = () => {
    dataProvider
      .getList("aeronefs", {})
      .then(({ data }) => setAeronefs(data));
  };

  const getOptions = () => {
    dataProvider
      .getList("options", {})
      .then(({ data }) => setOptions(data));
  };

  const getUsers = () => {
    dataProvider
      .getList("users", {})
      .then(({ data }) => setUsers(data));
  };

  const transform = data => ({
    ...data,
    fin: getEnd(data.debut, data.circuit),
    prix: getTotalPrice(data.circuit, data.option),
    circuit: isDefined(data.circuit) ? data.circuit['@id'] : null,
    avion: isDefined(data.avion) ? data.avion['@id'] : null,
    option: isDefined(data.option) ? data.option['@id'] : null,
    pilote: isDefined(data.pilote) ? data.pilote['@id'] : null
  });

  const getTotalPrice = (circuit, option) => {
    return circuit.prix + (isDefined(option) ? option.prix : 0);
  };

  const getEnd = (debut, circuit) => {
    const start = new Date(debut);
    const duration = new Date(circuit.duree);
    return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
  };

  return (
  <Edit transform={transform}>
      <SimpleForm>
          <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(7,0,0)) } label="Date"/>
                  <TextInput source="nom" label="Nom & prénom du passager"/>
                  <TextInput source="telephone" label="N° de téléphone"/> 
                  <NumberInput source="quantite" label="Nombre de passager(s)" readOnly={ true }/> 
                  <ReferenceInput reference="circuits" source="circuit.@id" label="Circuit" />
                  <ReferenceInput reference="options" source="option.@id" label="Option" />
                  <ReferenceInput reference="users" source="pilote.@id" label="Pilote" />
                  <ReferenceInput reference="aeronefs" source="avion.@id" label="Aéronef" />
                  <SelectInput source="statut" choices={ status} />
                  <TextInput source="remarques" label="Remarques" multiline/>
                  <BooleanInput source="report" label="Report"/>
      </SimpleForm>
  </Edit>
  )
};