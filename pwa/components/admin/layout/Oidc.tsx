import { ForwardedRef, forwardRef } from "react";
import { LogoutClasses } from "react-admin";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { ListItemIcon, ListItemText, MenuItem } from "@mui/material";

const Oidc = forwardRef((props, ref: ForwardedRef<any>) => {

    return (
        <MenuItem
        className="logout"
        component="li"
        {...props}
        >
             <a
                href="https://localhost/oidc/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center w-full no-underline text-inherit"
            >      
                <ListItemIcon className={LogoutClasses.icon}>
                        <ManageAccountsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                    Administration
                </ListItemText>
            </a>
        </MenuItem>
    );
    });
    Oidc.displayName = "Administration";

export default Oidc;
