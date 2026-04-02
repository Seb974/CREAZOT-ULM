import { TextInput, SimpleForm, Edit, FileInput, FileField, useRecordContext } from "react-admin";
import { Typography, Divider, Box, Accordion, AccordionSummary, AccordionDetails, Link, Button, Alert, CircularProgress } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudIcon from "@mui/icons-material/Cloud";
import { useSiteSettings } from "../SiteSettingsProvider";
import { useSessionContext } from "../SessionContextProvider";
import React, { useState } from "react";
import { useWatch } from "react-hook-form";

const API_DOMAIN = process.env.NEXT_PUBLIC_ENTRYPOINT || "";
const API_KEY_MASK = "••••••••••••";

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

const ApiKeyInput = ({ source, label, helperText, ...rest }: { source: string; label: string; helperText?: string; fullWidth?: boolean }) => {
    const record = useRecordContext();
    const maskField = `${source}Mask`;
    const hasKey = !!record?.[maskField as keyof typeof record];

    return (
        <TextInput
            source={source}
            label={label}
            format={(v: string | null | undefined) => {
                if (v != null && v !== "") return v;
                return hasKey ? API_KEY_MASK : "";
            }}
            helperText={hasKey ? "Clé enregistrée. Saisissez une nouvelle valeur pour la remplacer." : helperText}
            {...rest}
        />
    );
};

const OdooTestButton = () => {
    const { session } = useSessionContext();
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

    const [odooUrl, odooBdd, odooUser, odooApiKey] = useWatch({
        name: ["odooUrl", "odooBdd", "odooUser", "odooApiKey"],
    });

    const handleTest = async () => {
        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`${API_DOMAIN}/admin/odoo/test-connection`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${session?.accessToken}`,
                },
                body: JSON.stringify({
                    url: odooUrl || "",
                    db: odooBdd || "",
                    user: odooUser || "",
                    apiKey: odooApiKey || API_KEY_MASK,
                }),
            });
            const data = await response.json();
            setResult(data);
        } catch {
            setResult({ success: false, message: "Erreur réseau lors du test." });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ mt: 1 }}>
            <Button
                variant="outlined"
                color="primary"
                startIcon={loading ? <CircularProgress size={18} /> : <CloudIcon />}
                onClick={handleTest}
                disabled={loading}
                sx={{ textTransform: "none" }}
            >
                {loading ? "Test en cours..." : "Tester la connexion Odoo"}
            </Button>
            {result && (
                <Alert severity={result.success ? "success" : "error"} sx={{ mt: 1.5 }}>
                    {result.message}
                </Alert>
            )}
        </Box>
    );
};

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

        if (result.notamifyApiKey === API_KEY_MASK || result.notamifyApiKey == null) {
            delete result.notamifyApiKey;
        }
        if (result.odooApiKey === API_KEY_MASK || result.odooApiKey == null) {
            delete result.odooApiKey;
        }

        delete result.notamifyApiKeyMask;
        delete result.odooApiKeyMask;

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
                            <Typography>API NOTAM (Notamify)</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                Clé API pour récupérer les NOTAMs depuis Notamify.{" "}
                                <Link href="https://notamify.com/notam-api" target="_blank" rel="noopener">
                                    Créer un compte sur notamify.com
                                </Link>
                            </Typography>
                            <ApiKeyInput source="notamifyApiKey" label="Clé API Notamify" fullWidth />
                            <Box sx={{ display: "flex", gap: 2, mt: 1.5, flexWrap: "wrap" }}>
                                <Link
                                    href="https://notamify.com/api-manager"
                                    target="_blank"
                                    rel="noopener"
                                    sx={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 0.5 }}
                                >
                                    • Consulter les crédits restants
                                </Link>
                                <Link
                                    href="https://notamify.com/api-manager"
                                    target="_blank"
                                    rel="noopener"
                                    sx={{ fontSize: "0.85rem", display: "flex", alignItems: "center", gap: 0.5 }}
                                >
                                    • Recharger en crédits
                                </Link>
                            </Box>
                        </AccordionDetails>
                    </Accordion>

                    <Accordion sx={{ mt: 3, width: "100%" }} defaultExpanded={false}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                            <Typography>Intégration Odoo</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                            <TextInput source="odooUrl" label="URL Odoo" fullWidth helperText="Ex: https://votre-instance.odoo.com" />
                            <Box display="flex" gap={2} width="100%">
                                <Box flex={1}>
                                    <TextInput source="odooBdd" label="Base de données" fullWidth helperText="Nom de la base Odoo" />
                                </Box>
                                <Box flex={1}>
                                    <TextInput source="odooUser" label="Utilisateur Odoo" fullWidth helperText="Email ou login de l'utilisateur" />
                                </Box>
                            </Box>
                            <ApiKeyInput source="odooApiKey" label="Clé API Odoo" fullWidth helperText="Clé API ou mot de passe" />
                            <OdooTestButton />
                        </AccordionDetails>
                    </Accordion>
                </SimpleForm>
            </Edit>
        </div>
    );
};
