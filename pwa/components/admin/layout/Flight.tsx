import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import { ForwardedRef, forwardRef } from "react";
import { LogoutClasses, useTranslate } from "react-admin";

import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import Link from 'next/link';
import { redirect } from 'next/navigation'

import { useRouter } from 'next/navigation'

// import ExitIcon from "@mui/icons-material/PowerSettingsNew";
// import { signOut, useSession } from "next-auth/react";

// import { NEXT_PUBLIC_OIDC_SERVER_URL } from "../../../config/keycloak";

const Flight = forwardRef((props, ref: ForwardedRef<any>) => {

    // const router = useRouter();

    // const handleClick = () => redirect(`/admin#/prestations/create`);

    return (
        <MenuItem
        className="logout"
        // onClick={handleClick}
        // ref={ref}
        component="li"
        {...props}
        >
        <ListItemIcon className={LogoutClasses.icon}>
            <Link href="/admin#/prestations/create">
                <AirplaneTicketIcon fontSize="small" />
            </Link>
        </ListItemIcon>
        <ListItemText>
            Enregistrer un vol
        </ListItemText>
        </MenuItem>
    );
    });
    Flight.displayName = "Flights";

export default Flight;
