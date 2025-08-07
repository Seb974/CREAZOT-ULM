import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useRecordContext } from 'react-admin';
import { useState } from 'react';
import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import { useMediaQuery } from '@mui/material';
import { isDefined } from '../../../app/lib/utils';
import { useSessionContext } from "../../admin/SessionContextProvider";

const disabledStyle = {
  pointerEvents: 'none',
  color: 'gray',
  opacity: 0.6,
  textDecoration: 'none',
  cursor: 'default'
};

// Animation de pulsation
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
`;

// Icône stylisée avec effet de pulsation
const PulsingIcon = styled(PictureAsPdfIcon)`
  animation: ${pulse} 1s infinite;
  color: red; // optionnel : plus funky 😁
`;

const DownloadGiftButton = () => {

    const record = useRecordContext();
    const { session } = useSessionContext();
    const [loading, setLoading] = useState(false);
    // @ts-ignore
    const isSmall = useMediaQuery(theme => theme.breakpoints.down('sm'));

    const enabledStyle = { 
        textDecoration: 'none', 
        pointerEvents: loading ? 'none' : 'auto', 
        opacity: loading ? 0.6 : 1
    }

    if (!record || !record.id) return null;

    const handleDownload = async (e: React.MouseEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        
        if (loading) return;
        setLoading(true);

        try {
            const response = await fetch(`/admin/bons-cadeaux/${record.originId}/download`, {
                method: 'GET',
                // @ts-ignore
                headers: new Headers({'Authorization': `Bearer ${session?.data?.accessToken}`})
            })
            const blob = await response.blob();
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'bon_cadeau.pdf';
            link.click();
        } catch (error) {
            console.error('Erreur lors du téléchargement du PDF :', error);
        } finally {
            setLoading(false);
        }
    };

    const isDisabled = !isDefined(record) || record.used || (isDefined(record.gift) && !record.gift);

    return (
        // @ts-ignore
        <a href="#" onClick={handleDownload} style={isDisabled ? disabledStyle : enabledStyle } title={loading ? "Génération en cours..." : "Télécharger le bon cadeau"} className="text-red-700">
            { loading ? <PulsingIcon /> : <PictureAsPdfIcon /> }
        </a>
    );
};

export default DownloadGiftButton;
