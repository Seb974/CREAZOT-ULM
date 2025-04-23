import AirplaneTicketIcon from '@mui/icons-material/AirplaneTicket';
import EditCalendarIcon from '@mui/icons-material/EditCalendar';
import { ForwardedRef, forwardRef } from "react";
import { LogoutClasses } from "react-admin";

import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { Link } from 'react-router-dom';

const Reservation = forwardRef((props, ref: ForwardedRef<any>) => {

    return (
        <MenuItem
            className="logout"
            component="li"
            {...props}
        >
            <Link to="/reservations/create" className="flex">       
                <ListItemIcon className={LogoutClasses.icon}>
                        <EditCalendarIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                    Créer une réservation
                </ListItemText>
            </Link>
        </MenuItem>
    );
    });
    Reservation.displayName = "Reservations";

export default Reservation;
