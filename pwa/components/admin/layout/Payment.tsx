import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import { ForwardedRef, forwardRef } from "react";
import { LogoutClasses } from "react-admin";

import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import { Link } from 'react-router-dom';

const Payment = forwardRef((props, ref: ForwardedRef<any>) => {

    return (
        <MenuItem
        className="logout"
        component="li"
        {...props}
        >
            <Link to="/payments/create" className="flex">       
                <ListItemIcon className={LogoutClasses.icon}>
                        <PointOfSaleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                    Créer un paiement
                </ListItemText>
            </Link>
        </MenuItem>
    );
    });
    Payment.displayName = "Payments";

export default Payment;
