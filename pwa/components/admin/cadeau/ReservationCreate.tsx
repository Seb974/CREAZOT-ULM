import { DateTimeInput, ReferenceInput, SimpleForm, Create, required, useDataProvider, useCreate, useUpdate, useRedirect, useNotify, SelectInput, FunctionField } from "react-admin";
import { useLocation } from 'react-router-dom';
import { generateSafeCode, getRandomColor, isDefined, isDefinedAndNotVoid, isNotBlank } from "../../../app/lib/utils";
import { useEffect, useRef, useState } from "react";
import { useClient } from '../../admin/ClientProvider';
import { status } from "../../../app/lib/reservation";
import { useWatch } from 'react-hook-form';
import { clientWithOptions, clientWithPartners } from "../../../app/lib/client";

const PrepaymentHelperText = ({ prepayments }) => {
    const selectedId = useWatch({ name: 'prepayment' });
    const  data = prepayments.find(p => p.id === selectedId);
    
    if (!data) return null;
    const {quantite, circuit, options } = data;

    return `${quantite ?? 1} ${ circuit.nom } ${ isDefined(options) ? ` avec ${ options.nom }` : ''}`;
};

export const ReservationCreate = () => {

  const notify = useNotify();
  const redirect = useRedirect();
  const [create] = useCreate();
  const [update] = useUpdate();
  const { client } = useClient();
  const location = useLocation();
  const dataProvider = useDataProvider();
  const isOperating = useRef(false);
  const [options, setOptions] = useState([]);
  const [prepayments, setPrepayments] = useState([]);

  const searchParams = new URLSearchParams(location.search);
  const debut = searchParams.get('debut');

  useEffect(() => {
      getPrepayments();
      getOptions();
  }, []);

  const getPrepayments = () => {
    dataProvider
        .getList("cadeaux", {})
        .then(({ data }) => setPrepayments(data));
  };

  const getOptions = () => {
    dataProvider
        .getList("options", {})
        .then(({ data }) => setOptions(data));
  };
    
  const onSubmit = async ({debut, statut, prepayment}) => {
    if (isOperating.current) return;

    isOperating.current = true;

    try {  
      const selection = prepayments.find(p => p['@id'] === prepayment);
      const { telephone, email, quantite, beneficiaire, circuit, origine } = selection;
      const selectedOptions = clientWithOptions(client) ? getOptionsArray(selection.options, quantite ?? 1, options) : [];
      const data = {
        telephone: telephone ?? '',
        email: email ?? '',
        quantite: quantite ?? 1, 
        debut: new Date(debut),
        fin: getEnd(new Date(debut), circuit),
        nom: beneficiaire,
        color: getRandomColor(),
        paid: true,
        upsell: false,
        report: false,
        contact: [],
        remarques: '',
        statut,
        circuit: circuit['@id'],
        cadeau: selection['@id'],
        origine: clientWithPartners(client) && isDefinedAndNotVoid(origine) ? origine.map(o => o['@id']) : [],
        code: generateSafeCode('RESA')
      };

      for (let i = 0; i < data.quantite; i++) {
        const option = isDefinedAndNotVoid(selectedOptions) && isDefined(selectedOptions[i]) ? selectedOptions[i]['@id'] : null;
        const prix = getTotalPrice(circuit, option, origine);
        const newData = {...data, option, prix };

        await create('reservations', {data: newData});
        await updatePrepayment(selection);
      }
      notify(`${ data.quantite > 1 ? 'Les réservations ont bien été enregistrées.' : 'La réservation a bien été enregistrée.' }`, { type: 'info' });
      if (debut) {
        const dateStr = new Date(data.debut).toISOString().slice(0, 10);
        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = `/admin#/?scroll=calendar&date=${dateStr}`;
      } else {
        redirect('list', 'cadeaux'); 
      }
    } catch (error) {
      notify(`Une erreur bloque l\'enregistrement de la réservation.`, { type: 'error' });
      console.error(error);
      if (debut)
        window.location.href = `/admin#/?scroll=calendar&date=${new Date(debut).toJSON().slice(0, 10) || ''}`;
      else
        redirect('list', 'cadeaux'); 
    } finally {
      isOperating.current = false;
    }
  };
        
  const getEnd = (debut, circuit) => {
    const start = new Date(debut);
    const duration = new Date(circuit.duree);
    return new Date(start.setHours(start.getHours() + duration.getHours(), start.getMinutes() + duration.getMinutes(), start.getSeconds() + duration.getSeconds()));
  };

  const getTotalPrice = (circuit, option, origines) => {
      const maxOriginDiscount = isDefinedAndNotVoid(origines) ? getMaxDiscountFromOrigin(origines) : 0;
      return (isDefined(circuit) && isDefined(circuit.prix) ? circuit.prix : 0) * (1 - (maxOriginDiscount / 100)) + (isDefined(option) && isDefined(option.prix) ? option.prix : 0);
  };
        
  const getMaxDiscountFromOrigin = origines =>  origines.map(o => o.discount).reduce((max, current) => current > max ? current : max, 0);

  const getOptionsArray = (selectedOptions, quantite, bddOptions) => {
      let options = isDefined(selectedOptions) && isDefinedAndNotVoid(selectedOptions.options) ? selectedOptions.options.map(o => bddOptions.find(option => option['@id'] === o['@id'])) : [];
      const missingInputs = quantite - options.length;
      if (missingInputs > 0) {
        for (let i = 0; i < missingInputs; i++) {
          options.unshift(null);
        }
      }
      return options;
  };

  const getFormattedPrepayment = prepayment => {
    const { circuit, options, option, origine } = prepayment; 
    return {
      ...prepayment, 
      circuit: isDefined(circuit) ? typeof circuit === 'string' ? circuit : circuit['@id'] : null,
      options: isDefined(options) ? typeof options === 'string' ? options : options['@id'] : null,
      option: isDefined(option) ? typeof option === 'string' ? option : option['@id'] : null,
      origine: isDefinedAndNotVoid(origine) ? origine.map(o => typeof o === 'string' ? o : o['@id']) : []
    };
  };

  const updatePrepayment = async prepayment => {
    const formattedPrepayment = getFormattedPrepayment(prepayment);
    await update('reservations', {
      id: formattedPrepayment.id,
      data: {...formattedPrepayment, used: true},
      previousData: formattedPrepayment
    });
  };

  return (
    // @ts-ignore
    <Create resource="reservations" redirect="list" mutationMode="pessimistic">
      <SimpleForm onSubmit={onSubmit} defaultValues={{ debut }}>
        <DateTimeInput source="debut" defaultValue={ new Date((new Date()).setHours(7,0,0)) } label="Décollage" validate={required()}/>
        <ReferenceInput reference="cadeaux" source="prepayment" label="Prépaiement" filter={{ used: false }}>
          <SelectInput optionText="name" helperText={<PrepaymentHelperText prepayments={ prepayments }/>} label="Prépaiement" validate={required()}/>
        </ReferenceInput>
        <SelectInput source="statut" choices={ status } defaultValue={ status[0].id } validate={required()}/>
      </SimpleForm>
    </Create>
  ) ;
}