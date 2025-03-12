"use client";

import Head from "next/head";
import { useRef } from "react";
import { type DataProvider, defaultTheme } from "react-admin";
import { signIn, useSession } from "next-auth/react";
import SyncLoader from "react-spinners/SyncLoader";
import {
  fetchHydra,
  HydraAdmin,
  hydraDataProvider,
  ResourceGuesser,
} from "@api-platform/admin";
import { parseHydraDocumentation } from "@api-platform/api-doc-parser";
import { CustomRoutes } from 'react-admin';
import { Route } from "react-router-dom";
import { type Session } from "../../app/auth";
import authProvider from "../../components/admin/authProvider";
import Layout from "./layout/Layout";
import { ENTRYPOINT } from "../../config/entrypoint";
import prestationResourceProps from "./prestation";
import circuitResourceProps from "./circuit";
import volResourceProps from "./vol/";
import i18nProvider from "./i18nProvider";
import Dashboard from "../dashboard/components/Dashboard/Dashboard";

const apiDocumentationParser = (session: Session) => async () => {
  try {
    return await parseHydraDocumentation(ENTRYPOINT, {
      headers: {
        Authorization: `Bearer ${session?.accessToken}`,
      },
    });
  } catch (result) {
    // @ts-ignore
    const { api, response, status } = result;
    if (status !== 401 || !response) {
      throw result;
    }

    return {
      api,
      response,
      status,
    };
  }
};

const myTheme = {
  ...defaultTheme,
  palette: {
      mode: 'light',
  }
};

const AdminAdapter = ({
  session,
  children,
}: {
  session: Session;
  children?: React.ReactNode | undefined;
}) => {
  // @ts-ignore
  const dataProvider = useRef<DataProvider>();

  dataProvider.current = hydraDataProvider({
    entrypoint: ENTRYPOINT,
    httpClient: (url: URL, options = {}) =>
      fetchHydra(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
        },
      }),
    apiDocumentationParser: apiDocumentationParser(session),
  });

  return (
    <HydraAdmin
      requireAuth
      authProvider={authProvider}
      // @ts-ignore
      dataProvider={dataProvider.current}
      entrypoint={window.origin}
      i18nProvider={i18nProvider}
      dashboard={ Dashboard }
      darkTheme={ null }
      layout={Layout}
      // theme={ myTheme }
    >
      {!!children && children}
    </HydraAdmin>
  );
};

const AdminWithOIDC = () => {
  // Can't use next-auth/middleware because of https://github.com/nextauthjs/next-auth/discussions/7488
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <SyncLoader size={8} color="#46B6BF" />;
  }

  // @ts-ignore
  if (!session || session?.error === "RefreshAccessTokenError") {
    (async () => await signIn("keycloak"))();

    return;
  }

  
  return (
    // @ts-ignore
    <AdminAdapter session={session}>
      {/* <CustomRoutes>
          <Route path="/vols" element={<PrestationsList />} />
      </CustomRoutes> */}
      <ResourceGuesser name="prestations" {...prestationResourceProps} />
      <ResourceGuesser name="vols" {...volResourceProps}/>
      <ResourceGuesser name="passagers"/>
      <ResourceGuesser name="circuits" {...circuitResourceProps}/>
      <ResourceGuesser name="aeronefs"/>
      <ResourceGuesser name="options"/>
      <ResourceGuesser name="natures"/>
      <ResourceGuesser name="users"/>
      <ResourceGuesser name="reservations"/>
    </AdminAdapter>
  );
};

const Admin = () => (
  <>
    <Head>
      <title>PLANETAIR974 - Administration</title>
    </Head>

    {/*@ts-ignore*/}
    <AdminWithOIDC />
  </>
);

export default Admin;
