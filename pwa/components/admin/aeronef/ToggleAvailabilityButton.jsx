import { useUpdate, useNotify, useRefresh, useRecordContext } from "react-admin";
import { IconButton, Tooltip } from "@mui/material";
import { CheckCircle, Cancel } from "@mui/icons-material";
import { getFormattedValueForBackEnd, isDefined, isDefinedAndNotVoid } from "../../../app/lib/utils";
import { syncDocuments } from "../../../app/lib/client";
import { useSessionContext } from "../SessionContextProvider";
import React from "react";

const ToggleAvailabilityButton = ({ label, textAlign }) => {
    const record = useRecordContext();
    const { session } = useSessionContext();
    const [update, { isLoading }] = useUpdate();
    const notify = useNotify();
    const refresh = useRefresh();

    const getDocuments = async (documents) => {   
        const docs = documents.map(document => {
            return isDefined(document?.['@id']) ? document : { ...document, description: document.title };
        });
        return await syncDocuments(docs, session);
    };

    const transform = async ({documents, createdBy, updatedBy, ...data}) => {
        const documentIds = isDefinedAndNotVoid(documents) ? await getDocuments(documents) : [];
        return {
            ...data, 
            documents: documentIds,
            isAvailable: !data.isAvailable,
            createdBy: getFormattedValueForBackEnd(createdBy),
            updatedBy: getFormattedValueForBackEnd(updatedBy),
        };
    };

    const handleClick = async e => {
        e.stopPropagation();
        const transformedData = await transform(record);
        update('aeronefs', { id: record.id, data: transformedData, previousData: record }, {   
            onSuccess: () => {
                notify(`${getAeronefName(record)} est maintenant ${!record.isAvailable ? "disponible" : "indisponible"}`, { type: "info" });
                refresh();
            },
            onError: () => {
                notify("Erreur lors du changement de disponibilité", { type: "warning" });
            }
        });
    };

    const getAeronefName = (aeronef) => {
        return isDefined(aeronef?.immatriculation) && aeronef?.immatriculation.length > 0 ? aeronef?.immatriculation : "L'aéronef";
    }

    return (
        <Tooltip title={record.isAvailable ? "Rendre indisponible" : "Rendre disponible"}>
        <span>
            <IconButton onClick={ handleClick } disabled={ isLoading } color={ record.isAvailable ? "success" : "error" }>
            {record.isAvailable ? <CheckCircle /> : <Cancel />}
            </IconButton>
        </span>
        </Tooltip>
    );
};

export default ToggleAvailabilityButton;
