"use client"

import React, { useEffect, useState } from "react";
import FormLayout from "../components/passenger/FormLayout";
import Form from "../components/passenger/Form";
import { isDefined } from "./lib/utils";

export default function Page() {

  const [client, setClient] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchClients = async () => {
      setLoading(true);
      try {
        const response = await fetch('/clients', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        });
  
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des clients');
        }
  
        const data = await response.json();
        setClient(data[0]);
      } catch (err) {
        setError(err.message || 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };
    fetchClients();
  }, []);

  useEffect(() => {
    // @ts-ignore
    if (!loading && (!isDefined(client) || !isDefined(client.hasPassengerRegistration) || !client.hasPassengerRegistration)) {
      window.location.replace('/admin#/');
    }
  }, [loading, client]);

  return loading ? 
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div> 
    : 
    // @ts-ignore
    !isDefined(client) || !client.hasPassengerRegistration ? 
      <></> 
      : 
      <FormLayout client={ client }>
        <Form/>
      </FormLayout>

};
