"use client"

import React, { useEffect, useState } from "react";
import FormLayout from "../../components/passenger/FormLayout";
import Form from "../../components/passenger/Form";
import { useParams } from "next/navigation";
import { getClientBySlug } from "../lib/api";

export default function SlugPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const fetchClient = async () => {
      setLoading(true);
      try {
        const resolved = await getClientBySlug(slug);
        if (!resolved) {
          setNotFound(true);
          return;
        }
        if (!resolved.hasPassengerRegistration) {
          window.location.replace('/admin#/');
          return;
        }
        setClient(resolved);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchClient();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Espace introuvable</h2>
        <p className="text-gray-500 mb-8">
          L&apos;espace <strong>&quot;{slug}&quot;</strong> n&apos;existe pas ou n&apos;est plus disponible.
        </p>
        <a href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Retour à l&apos;accueil
        </a>
      </div>
    );
  }

  return (
    <FormLayout client={client}>
      <Form client={client} />
    </FormLayout>
  );
}
