import {
  Datagrid,
  DateField,
  FunctionField,
  List,
  TextField,
  TextInput,
  SelectInput,
  TopToolbar,
  FilterButton,
  useNotify,
  useRefresh,
} from "react-admin";
import { Chip, Box, Button, Typography } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useSessionContext } from "../SessionContextProvider";
import { useClient } from "../ClientProvider";
import axios from "axios";
import { ENTRYPOINT } from "../../../config/entrypoint";

const statusConfig: Record<string, { label: string; color: "default" | "warning" | "info" | "primary" | "success" | "error" }> = {
  pending: { label: "En attente", color: "warning" },
  analyzing: { label: "Analyse IA", color: "info" },
  proposing: { label: "Créneaux proposés", color: "primary" },
  awaiting_customer: { label: "Attente client", color: "info" },
  awaiting_club: { label: "À valider", color: "warning" },
  confirmed: { label: "Confirmée", color: "success" },
  cancelled: { label: "Annulée", color: "error" },
  expired: { label: "Expirée", color: "default" },
};

const channelLabels: Record<string, string> = {
  email: "📧 Email",
  voice: "📞 Vocal",
  sms: "💬 SMS",
  whatsapp: "💬 WhatsApp",
};

const conversationFilters = [
  <TextInput key="customerName" source="customerName" label="Nom client" alwaysOn />,
  <SelectInput
    key="status"
    source="status"
    label="Statut"
    choices={Object.entries(statusConfig).map(([id, { label }]) => ({ id, name: label }))}
    alwaysOn
  />,
  <SelectInput
    key="channel"
    source="channel"
    label="Canal"
    choices={[
      { id: "email", name: "Email" },
      { id: "voice", name: "Vocal" },
      { id: "sms", name: "SMS" },
      { id: "whatsapp", name: "WhatsApp" },
    ]}
  />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
  </TopToolbar>
);

export const ConversationThreadList = () => {
  const { session } = useSessionContext();
  const { client } = useClient();
  const notify = useNotify();
  const refresh = useRefresh();

  const handleValidate = async (record: any) => {
    try {
      await axios.post(
        `${ENTRYPOINT}/admin/ai-reservation/conversations/${record.id}/validate`,
        { slotIndex: 0 },
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );
      notify("Réservation créée avec succès", { type: "success" });
      refresh();
    } catch (err: any) {
      notify(err?.response?.data?.error || "Erreur lors de la validation", { type: "error" });
    }
  };

  const handleCancel = async (record: any) => {
    try {
      await axios.post(
        `${ENTRYPOINT}/admin/ai-reservation/conversations/${record.id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${session?.accessToken}` } }
      );
      notify("Conversation annulée", { type: "info" });
      refresh();
    } catch (err: any) {
      notify(err?.response?.data?.error || "Erreur lors de l'annulation", { type: "error" });
    }
  };

  return (
    <List
      filters={conversationFilters}
      actions={<ListActions />}
      sort={{ field: "createdAt", order: "DESC" }}
      perPage={25}
      title="Assistant IA — Conversations"
    >
      <Datagrid bulkActionButtons={false}>
        <FunctionField
          label="Canal"
          render={(record: any) => (
            <Typography variant="body2">{channelLabels[record?.channel] || record?.channel}</Typography>
          )}
        />
        <TextField source="customerName" label="Client" />
        <TextField source="customerEmail" label="Email" />
        <TextField source="customerPhone" label="Téléphone" />
        <FunctionField
          label="Statut"
          render={(record: any) => {
            const cfg = statusConfig[record?.status] || { label: record?.status, color: "default" as const };
            return <Chip label={cfg.label} color={cfg.color} size="small" />;
          }}
        />
        <FunctionField
          label="Résumé"
          render={(record: any) => (
            <Typography variant="body2" sx={{ maxWidth: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {record?.summary || "—"}
            </Typography>
          )}
        />
        <DateField source="createdAt" label="Date" showTime />
        <FunctionField
          label="Actions"
          render={(record: any) => (
            <Box sx={{ display: "flex", gap: 0.5 }}>
              {record?.status === "awaiting_club" && (
                <>
                  <Button
                    size="small"
                    color="success"
                    startIcon={<CheckCircleIcon />}
                    onClick={() => handleValidate(record)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Valider
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<CancelIcon />}
                    onClick={() => handleCancel(record)}
                    sx={{ textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Refuser
                  </Button>
                </>
              )}
              {record?.status !== "awaiting_club" && record?.status !== "confirmed" && record?.status !== "cancelled" && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<CancelIcon />}
                  onClick={() => handleCancel(record)}
                  sx={{ textTransform: "none", fontSize: "0.75rem" }}
                >
                  Annuler
                </Button>
              )}
            </Box>
          )}
        />
      </Datagrid>
    </List>
  );
};
