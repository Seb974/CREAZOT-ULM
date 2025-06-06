import { AppBar, UserMenu, TitlePortal } from "react-admin";
import Logout from "./Logout";
import Flight from "./Flight";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Link } from 'react-router-dom';
import Reservation from "./Reservation";
import { isDefined } from "../../../app/lib/utils";
import { useClient } from '../../admin/ClientProvider';
import GlobalLoader from "../../admin/layout/GlobalLoader";
import Oidc from "./Oidc";
import { useState } from "react";
import Payment from "./Payment";

const CustomAppBar = () => {

  const session = useSession();
  const user = session.data.user;
  const { client, loading } = useClient();
  const [fallback, setFallback] = useState(false);

  const logoSrc = isDefined(client) && isDefined(client.logo) ? `${client.logo}?v=${Date.now()}` : "/images/logo.png";

  return loading ? <GlobalLoader/> : 
    isDefined(client) && (
      <AppBar
        // color={"error"}
        sx={{ backgroundColor: client.color || 'primary' }}
        userMenu={
          <UserMenu>
            {/* @ts-ignore  */}
            { (isDefined(client) && isDefined(client.hasReservation) && client.hasReservation) && isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") && <Reservation /> }
            <Flight />
            <Payment />
            {/* @ts-ignore  */}
            { (isDefined(client) && isDefined(client.hasReservation) && client.hasReservation) && isDefined(session) && isDefined(user) &&  user.roles.find(r => r === "admin") && <Oidc /> }
            <Logout />
          </UserMenu>
        }
      >
        <TitlePortal />
        <div className="flex-1">
          <Link to="/">
            <div style={{ position: "relative", width: 50, height: 50 }}>
              <Image
                alt={"logo " + client.name}
                src={fallback ? "/images/logo.png" : (logoSrc || "/images/logo.png")}
                fill
                sizes="50px" 
                onError={() => setFallback(true)}
                className="object-contain"
              />
            </div>

          </Link>
          
        </div>
      </AppBar>
    )
};

export default CustomAppBar;
