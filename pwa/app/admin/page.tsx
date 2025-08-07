"use client";

import dynamic from "next/dynamic";
import { Toaster } from "react-hot-toast";
import { ClientProvider, useClient } from "../../components/admin/ClientProvider";

const Admin = dynamic(() => import("../../components/admin/Admin"), {
  ssr: false,
});

const AdminPage = () => (
  <>
    <Toaster position="top-right" />
    <ClientProvider>
      <Admin />
    </ClientProvider>
    <style jsx global>
      {`
      body {
        margin: 0;
        padding: 0;
        font-family: sans-serif;
      }
      `}
    </style>
  </>
);
export default AdminPage;
