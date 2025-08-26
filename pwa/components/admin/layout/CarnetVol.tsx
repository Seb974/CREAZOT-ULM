import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";
import RecentActorsIcon from '@mui/icons-material/RecentActors';
import { ForwardedRef, forwardRef } from "react";
import { LogoutClasses } from "react-admin";
import { Link } from 'react-router-dom';

const CarnetVol = forwardRef((props, ref: ForwardedRef<any>) => {

    return (
        <MenuItem
        className="logout"
        component="li"
        {...props}
        >
            <Link to="/carnet_vols" className="flex">       
                <ListItemIcon className={LogoutClasses.icon}>
                        <RecentActorsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                    Mon carnet de vol
                </ListItemText>
            </Link>
        </MenuItem>
    );
    });
    CarnetVol.displayName = "Payments";

export default CarnetVol;
