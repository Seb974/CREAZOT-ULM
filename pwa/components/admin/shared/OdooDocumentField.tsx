import { FunctionField, useRecordContext } from "react-admin";
import { Box, Link } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const getDocUrl = (doc: any) => doc?.odooContentUrl || doc?.contentUrl || null;
const getDocLabel = (doc: any) => doc?.description || doc?.title || "Document";

const isOdooUrl = (url: string) => url?.includes("/admin/odoo-documents/");

const openOdooDocument = async (url: string, e: React.MouseEvent) => {
    e.preventDefault();
    try {
        const session = JSON.parse(sessionStorage.getItem("internSession") || "{}");
        const token = session?.accessToken;
        if (!token) {
            console.error("Pas de token OIDC disponible");
            return;
        }
        const clientRaw = sessionStorage.getItem("client");
        const headers: Record<string, string> = { Authorization: "Bearer " + token };
        if (clientRaw) {
            try {
                const parsed = JSON.parse(clientRaw);
                if (parsed?.id) headers["X-Client-Id"] = String(parsed.id);
            } catch (_) {}
        }
        const res = await fetch(url, { headers });
        if (!res.ok) throw new Error("HTTP " + res.status);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, "_blank");
    } catch (err) {
        console.error("Erreur ouverture document Odoo:", err);
    }
};

const DocLink = ({ url, label }: { url: string; label: string }) => {
    if (isOdooUrl(url)) {
        return (
            <Link href={url} onClick={(e) => openOdooDocument(url, e)}
                underline="hover" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.85rem", cursor: "pointer" }}>
                <AttachFileIcon sx={{ fontSize: 16 }} />
                {label}
            </Link>
        );
    }
    return (
        <Link href={url} target="_blank" rel="noopener noreferrer" underline="hover"
            sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontSize: "0.85rem" }}>
            <AttachFileIcon sx={{ fontSize: 16 }} />
            {label}
        </Link>
    );
};

export const SingleDocumentField = ({ source = "document", label = "Document" }: { source?: string; label?: string }) => (
    <FunctionField
        label={label}
        render={(record: any) => {
            const parts = source.split(".");
            let doc = record;
            for (const p of parts) doc = doc?.[p];
            if (!doc) return null;
            const url = getDocUrl(doc);
            if (!url) return null;
            return <DocLink url={url} label={getDocLabel(doc)} />;
        }}
    />
);

export const DocumentListField = ({ source = "documents", label = "Documents associes" }: { source?: string; label?: string }) => (
    <FunctionField
        label={label}
        render={(record: any) => {
            const docs = record?.[source];
            if (!docs || !Array.isArray(docs) || docs.length === 0) return null;
            return (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    {docs.map((doc: any, i: number) => {
                        const url = getDocUrl(doc);
                        if (!url) return null;
                        return <DocLink key={i} url={url} label={getDocLabel(doc)} />;
                    })}
                </Box>
            );
        }}
    />
);


export const MyFileField = ({ source }: { source: string }) => {
    const record = useRecordContext();
    if (!record) return null;

    const url = record.odooContentUrl || record[source];
    const label = record.description || record.title || record.path || "Sans nom";
    const isOdoo = url?.includes("/admin/odoo-documents/");

    return (
        <Link href={url} target={isOdoo ? undefined : "_blank"} rel="noopener noreferrer"
            onClick={isOdoo ? (e: any) => openOdooDocument(url, e) : undefined} underline="always"
            sx={{ color: "primary.main", fontSize: "0.85rem", cursor: "pointer" }}>
            {label}
        </Link>
    );
};
