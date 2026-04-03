import { Box, Link, Typography } from "@mui/material";
import { Create, SimpleForm, TextInput, NumberInput, SelectInput, DateInput, required, ArrayInput, SimpleFormIterator, FileInput, useRecordContext, BooleanInput } from "react-admin";
import { paymentMode, syncOdooDocument, tva } from "../../../app/lib/client";
import { useSessionContext } from "../SessionContextProvider";
import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useState } from "react";
import { isDefined } from "../../../app/lib/utils";
import { MyFileField } from "../shared/OdooDocumentField";

const TotalsWatcher = () => {
  const { setValue } = useFormContext();
  const details = useWatch({ name: "details" }) || [];
  const tvaRate = parseFloat(useWatch({ name: "tva" }) || 0);

  const [manualHT, setManualHT] = useState<boolean>(false);

  useEffect(() => {
    const totalTTC = details
      .map((d: any) => parseFloat(d?.amount || 0))
      .reduce((acc: number, val: number) => acc + val, 0);

    setValue("totalTTC", totalTTC, { shouldValidate: true, shouldDirty: true });

    if (!manualHT) {
      const totalHT = tvaRate > 0 ? parseFloat((totalTTC / (1 + tvaRate)).toFixed(2)) : totalTTC;
      setValue("totalHT", totalHT, { shouldValidate: true, shouldDirty: true });
    }
  }, [details, tvaRate, manualHT, setValue]);

  return (
    <NumberInput
      source="totalHT"
      label="Total HT (€)"
      helperText="Le montant HT est calculé automatiquement. Vous pouvez l'ajuster si nécessaire."
      onChange={(e: any) => {
        setManualHT(true);
        setValue("totalHT", parseFloat(e.target.value), { shouldValidate: true, shouldDirty: true });
      }}
    />
  );
};

export const ExpensesCreate = () => {

  const { session } = useSessionContext();
  const defaultDetails = [{ mode: '', amount: '' }];

  const transform = async data => {
    if (isDefined(data.document)) {
      const fileName = data?.document?.description || data?.document?.title || data?.document?.path || "Sans nom";
      const doc = data.document ? {...data.document, description: fileName} : null;
      const justificatif = await syncOdooDocument(doc, 'expense', null, session);
      return {... data, document: justificatif};
    }
    return data;
  };

  return (
    <Create transform={transform} redirect="list">
      <SimpleForm>
        <DateInput source="date" defaultValue={ new Date() } label="Date" validate={required()}/>
        <TextInput source="beneficiaire" label="Bénéficiaire" validate={required()}/>
        <TextInput source="libelle" label="Libellé"/>
        <Typography className="mt-4" variant="h6" gutterBottom>Modes de paiement</Typography>
        <ArrayInput source="details" label="" defaultValue={ defaultDetails }>
            <SimpleFormIterator inline disableAdd={false} disableRemove={true}>
                <SelectInput
                    source="mode"
                    label="Mode"
                    choices={ paymentMode }
                />
                <NumberInput source="amount" label="Montant (€)" validate={required()}/>
            </SimpleFormIterator>
        </ArrayInput>
        <NumberInput source="totalTTC" label="Total TTC (€)" readOnly/>
        <SelectInput source="tva" label="TVA appliquée" choices={ tva } defaultValue={ tva[0].id }/>
        <TotalsWatcher />
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%" sx={{ marginTop: '2em', marginBottom: '2em' }}>
            <Box flex={1}>
                <BooleanInput source="relatedToMaintenance" label="Spécifique à un entretien" fullWidth
                  helperText="Si coché, cette dépense pourra être rattachée à un entretien" defaultValue={ false }
                />
            </Box>
        </Box>
        <FileInput source="document" multiple={ false } label="Justificatif">
            <MyFileField source="contentUrl"/>
        </FileInput>
      </SimpleForm>
    </Create>
  )
};
