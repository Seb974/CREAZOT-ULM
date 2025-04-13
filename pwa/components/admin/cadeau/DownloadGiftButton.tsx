import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useRecordContext } from 'react-admin';
import { useSession } from "next-auth/react";

const DownloadGiftButton = () => {

    const record = useRecordContext();
    const session = useSession();

    if (!record || !record.id) return null;

    const handleDownload = (e) => {
        e.preventDefault();
        fetch(`/admin/bons-cadeaux/${record.originId}/download`, {
            method: 'GET',
            headers: new Headers({'Authorization': `Bearer ${session?.data.accessToken}`})
        })
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = 'bon_cadeau.pdf'; // Le nom du fichier
            link.click();
        });
    };

    return (
        <a href="#" onClick={ handleDownload }>
            <><PictureAsPdfIcon /></>
        </a>
    );
};

export default DownloadGiftButton;
