import { ArrayInput, BooleanInput, DateInput, Edit, FileInput, NumberInput, SelectInput, SimpleFormIterator, useRecordContext } from "react-admin";
import { SimpleForm, TextInput } from "react-admin";
import { useSessionContext } from "../SessionContextProvider";
import { paymentMode, syncDocument, tva } from "../../../app/lib/client";
import { Box, Link, Typography } from "@mui/material";
import { isDefined } from "../../../app/lib/utils";
import { useFormContext, useWatch } from "react-hook-form";
import { useEffect, useRef } from "react";

const TotalsWatcher = () => {
    const record = useRecordContext();
    const { setValue, getValues, control } = useFormContext();
    const details = useWatch({ name: "details", control }) || [];
    const tvaRaw = useWatch({ name: "tva", control }) ?? 0;
    const tvaRate = parseFloat(String(tvaRaw)) || 0;

    const initializedRef = useRef(false);
    const manualEditedRef = useRef(false);
    const skipNextAutoRecalcRef = useRef(false);

    useEffect(() => {
      if (!record || initializedRef.current) return;

      const t = setTimeout(() => {
        const current = getValues();
        let copiedSomething = false;

        if ((current.totalHT === undefined || current.totalHT === null || current.totalHT === "") && record.totalHT !== undefined) {
          setValue("totalHT", record.totalHT, { shouldDirty: false, shouldValidate: false });
          copiedSomething = true;
        }

        if ((current.totalTTC === undefined || current.totalTTC === null || current.totalTTC === "") && record.totalTTC !== undefined) {
          setValue("totalTTC", record.totalTTC, { shouldDirty: false, shouldValidate: false });
          copiedSomething = true;
        }

        skipNextAutoRecalcRef.current = copiedSomething;
        initializedRef.current = true;
      }, 0);

      return () => clearTimeout(t);
    }, [record, getValues, setValue]);

    useEffect(() => {
      if (!initializedRef.current) return;
      if (manualEditedRef.current) return;

      if (skipNextAutoRecalcRef.current) {
        skipNextAutoRecalcRef.current = false;
        return;
      }

      const totalTTC = details
        .map((d: any) => parseFloat(d?.amount ?? 0) || 0)
        .reduce((acc: number, val: number) => acc + val, 0);

      const totalHT = tvaRate > 0 ? parseFloat((totalTTC / (1 + tvaRate)).toFixed(2)) : totalTTC;

      const prevTotalTTC = getValues("totalTTC");
      const prevTotalHT = getValues("totalHT");

      if (prevTotalTTC !== totalTTC) {
        setValue("totalTTC", totalTTC, { shouldDirty: true });
      }
      if (prevTotalHT !== totalHT) {
        setValue("totalHT", totalHT, { shouldDirty: true });
      }
    }, [details, tvaRate, setValue, getValues]);

    return (
      <NumberInput
        source="totalHT"
        label="Total HT (€)"
        helperText="Le montant HT est recalculé si vous changez les paiements ou la TVA. Vous pouvez le modifier manuellement (arrête le recalcul)."
        onChange={(e: any) => {
            manualEditedRef.current = true;
            const v = parseFloat(e?.target?.value);
            setValue("totalHT", Number.isFinite(v) ? v : 0, { shouldDirty: true });
        }}
      />
  );
};

const MyFileField = ({ source }) => {
  const record = useRecordContext();
  if (!record) return null;

  const url = record[source];
  const label = record.description || record.title || record.path || "Sans nom";

  return (
    <Link href={url} target="_blank" rel="noopener noreferrer" underline="always"
      sx={{ color: "primary.main", fontSize: "0.85rem" }}
    >
      {label}
    </Link>
  );
};

export const ExpensesEdit = () => {

const { session } = useSessionContext();
  const defaultDetails = [{ mode: '', amount: '' }];

  const getDocument = async ({ document }, description = '') => {
      const finalDescription = description.length > 0 ? description : document?.rawFile?.name ?? '';
      const docWithDescription = document ? {...document, description: finalDescription} : null;
      return await syncDocument(docWithDescription, session);
  }

  const transform = async data => {
    if (isDefined(data.document)) {
      const fileName = data?.document?.description || data?.document?.title || data?.document?.path || "Sans nom";
      const justificatif = await getDocument(data, fileName);
      return {... data, document: justificatif};
    }
    return data;
  };

  return (
  <Edit transform={transform} redirect="list">
      <SimpleForm>
        <DateInput source="date" defaultValue={ new Date() } label="Date" />
        <TextInput source="beneficiaire" label="Bénéficiaire" />
        <TextInput source="libelle" label="Libellé"/>
        <Typography className="mt-4" variant="h6" gutterBottom>Modes de paiement</Typography>
        <ArrayInput source="details" label="" defaultValue={ defaultDetails }>
            <SimpleFormIterator inline disableAdd={false} disableRemove={true}>
                <SelectInput
                    source="mode"
                    label="Mode"
                    choices={ paymentMode }
                />
                <NumberInput source="amount" label="Montant (€)" />
            </SimpleFormIterator>
        </ArrayInput>
        <NumberInput source="totalTTC" label="Total TTC (€)" readOnly/>
        <SelectInput source="tva" label="TVA appliquée" choices={ tva } />
        <TotalsWatcher />
        <Box display="flex" gap={2} flexWrap="nowrap" width="100%" sx={{ marginTop: '1.5em', marginBottom: '2em' }}>
            <Box flex={1}>
                <BooleanInput source="relatedToMaintenance" label="Spécifique à un entretien" fullWidth
                  helperText="Si coché, cette dépense pourra être rattachée à un entretien"
                />
            </Box>
        </Box>
        <FileInput source="document" multiple={ false } label="Justificatif">
            <MyFileField source="contentUrl"/>
        </FileInput>
      </SimpleForm>
  </Edit>
  )
};