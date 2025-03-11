import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import { ForwardedRef, forwardRef } from "react";
import { LogoutClasses } from "react-admin";

import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { Link } from 'react-router-dom';

const Flight = forwardRef((props, ref: ForwardedRef<any>) => {

    return (
        <MenuItem
        className="logout"
        component="li"
        {...props}
        >
            <Link to="/prestations/create" className="flex">       
                <ListItemIcon className={LogoutClasses.icon}>
                        <AirplaneTicketIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                    Enregistrer un vol
                </ListItemText>
            </Link>
        </MenuItem>
    );
    });
    Flight.displayName = "Flights";

export default Flight;
