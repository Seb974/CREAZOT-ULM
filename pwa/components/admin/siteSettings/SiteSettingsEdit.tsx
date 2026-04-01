import { TextInput, SimpleForm, Edit, FileInput, FileField } from "react-admin";
import { Typography, Divider, Box, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useSiteSettings } from "../SiteSettingsProvider";
import { useSessionContext } from "../SessionContextProvider";

const IMAGE_FIELDS = [
    { source: "logo", type: "logo" },
    { source: "favicon", type: "favicon" },
    { source: "appleTouchIcon", type: "apple-touch-icon" },
] as const;

function getRawFileFromValue(value: unknown): File | null {
    if (value instanceof File) return value;
    if (value && typeof value === "object" && "rawFile" in value && (value as { rawFile?: unknown }).rawFile instanceof File) {
        return (value as { rawFile: File }).rawFile;
    }
    if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (first?.rawFile instanceof File) return first.rawFile;
    }
    return null;
}

function getExistingPath(value: unknown): string | undefined {
    if (typeof value === "string") return value;
    if (Array.isArray(value) && value.length > 0) {
        const first = value[0];
        if (first && typeof first === "object" && "src" in first && typeof (first as { src?: unknown }).src === "string" && !("rawFile" in first && (first as { rawFile?: unknown }).rawFile)) {
            return (first as { src: string }).src;
        }
    }
    return undefined;
}

export const SiteSettingsEdit = () => {
    const { updateSiteSettings } = useSiteSettings();
    const { session } = useSessionContext();

    const transform = async (data: Record<string, unknown>) => {
        const result = { ...data };

        for (const field of IMAGE_FIELDS) {
            const value = data[field.source];
            const file = getRawFileFromValue(value);

            if (file) {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("type", field.type);

                try {
                    const response = await fetch("/admin/upload/site-settings-asset", {
                        method: "POST",
                        body: formData,
                        headers: { Authorization: `Bearer ${session?.accessToken}` },
                    });
                    const json = await response.json();
                    if (response.ok && json.path) {
                        result[field.source] = json.path;
                    } else {
                        console.error(`Upload ${field.source} failed:`, json);
                        throw new Error(json.message || `Échec de l'upload (${field.source})`);
                    }
                } catch (e) {
                    console.error(`Upload ${field.source} error:`, e);
                    throw e;
                }
            } else {
                const path = getExistingPath(value);
                if (path !== undefined) {
                    result[field.source] = path;
                } else if (typeof value === "string") {
                    result[field.source] = value;
                }
            }
        }

        return result;
    };

    return (
        <div style={{ overflowX: "auto", width: "100%" }}>
            <Edit
                mutationMode="pessimistic"
                transform={transform}
                mutationOptions={{
                    onSuccess: (data: unknown) => {
                        updateSiteSettings(data);
                    },
                }}
            >
                <SimpleForm>
                    <Typography variant="h6" gutterBottom>
                        Identité
                    </Typography>
                    <TextInput source="name" label="Nom de la plateforme" fullWidth />
                    <TextInput source="url" label="URL du site" fullWidth />

                    <Divider sx={{ mt: 2, mb: 2, width: "100%" }} />

                    <Typography variant="h6" gutterBottom>
                        Identité visuelle
                    </Typography>
                    <FileInput
                        label="Logo"
                        source="logo"
                        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }}
                        format={(value) => {
                            if (typeof value === "string") {
                                return [{ src: value, title: value.split("/").pop() }];
                            }
                            return value;
                        }}
                    >
                        <FileField source="src" title="title" />
                    </FileInput>
                    <FileInput
                        label="Favicon"
                        source="favicon"
                        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"], "image/x-icon": [".ico"], "image/vnd.microsoft.icon": [".ico"] }}
                        format={(value) => {
                            if (typeof value === "string") {
                                return [{ src: value, title: value.split("/").pop() }];
                            }
                            return value;
                        }}
                    >
                        <FileField source="src" title="title" />
                    </FileInput>
                    <FileInput
                        label="Apple Touch Icon"
                        source="appleTouchIcon"
                        accept={{ "image/png": [".png"], "image/jpeg": [".jpg", ".jpeg"] }}
                        format={(value) => {
                            if (typeof value === "string") {
                                return [{ src: value, title: value.split("/").pop() }];
                            }
                            return value;
                        }}
                    >
                        <FileField source="src" title="title" />
                    </FileInput>

                    <Divider sx={{ mt: 2, mb: 2, width: "100%" }} />

                    <Typography variant="h6" gutterBottom>
                        Contact
                    </Typography>
                    <TextInput source="email" label="Adresse email" fullWidth />
                    <TextInput source="phone" label="Téléphone" fullWidth />
                    <TextInput source="address" label="Adresse" fullWidth />
                    <Box display="flex" gap={2} flexWrap="nowrap" width="100%">
                        <Box flex={1} display="flex" alignItems="center">
                            <TextInput source="zipcode" label="Code postal" />
                        </Box>
                        <Box flex={2}>
                            <TextInput source="city" label="Ville" />
                        </Box>
                    </Box>

                    <Divider sx={{ mt: 2, mb: 2, width: "100%" }} />

                    <Typography variant="h6" gutterBottom>
                        Email plateforme
                    </Typography>
                    <TextInput source="emailParams" label="Serveur d'email (paramètres)" fullWidth />
                    <TextInput source="emailAddressSender" label="Adresse email d'envoi" fullWidth />

                    <Accordion sx={{ mt: 3, width: "100%" }} defaultExpanded={false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Intégration Odoo</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextInput source="odooUrl" label="URL Odoo" fullWidth />
                            <TextInput source="odooApiKey" label="Clé API Odoo" fullWidth />
                        </AccordionDetails>
                    </Accordion>
                </SimpleForm>
            </Edit>
        </div>
    );
};
