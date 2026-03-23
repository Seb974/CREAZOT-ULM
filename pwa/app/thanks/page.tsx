"use client"

import { isDefined } from "../lib/utils";
import { getClientBySlug } from "../lib/api";
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Page() {

  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || '';
  const firstname = searchParams.get('firstname') || '';

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const name = firstname
    ? firstname.charAt(0).toUpperCase() + firstname.slice(1)
    : '';

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        if (slug) {
          const resolved = await getClientBySlug(slug);
          setClient(resolved);
        } else {
          const response = await fetch('/clients');
          if (!response.ok)
            throw new Error('Erreur réseau : ' + response.status);
          const data = await response.json();
          setClient(data['hydra:member']?.[0] ?? data[0] ?? null);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du client :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, [slug]);

  const renderWithImageAlignment = (html: string): string => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    doc.querySelectorAll('img').forEach((img) => {
        const url = new URL(img.src);
        const align = url.searchParams.get('align');

        img.classList.remove('img-align-left', 'img-align-center', 'img-align-right');

        if (!isDefined(align) || align === 'center') {
            const wrapper = doc.createElement('div');
            wrapper.className = 'img-align-center-wrapper';
            img.classList.add('img-align-center');
            img.parentNode?.insertBefore(wrapper, img);
            wrapper.appendChild(img);
        } else if (align === 'right') {
            img.classList.add('img-align-right');
        } else if (align === 'left') {
            img.classList.add('img-align-left');
        }
    });

    return renderWithVariables(doc.body.innerHTML);
}

const renderWithVariables = (html: string) => {
  return html.replace(/{{FIRSTNAME}}/g, name);
}

  return loading ? 
      <div className="mt-6 flex justify-center items-center w-full h-full">
          <CircularProgress color="error" size={50} />
      </div>
    :
    <div className="text-center mx-2">
        { isDefined(client) && isDefined(client.thanksImage) && (
          <div className="mt-6 mb-4 flex justify-center">
            <img src={client.thanksImage} alt="Merci" className="max-w-full h-auto rounded-lg" />
          </div>
        )}
        { isDefined(client) && isDefined(client.thanksMessage) &&
          <div dangerouslySetInnerHTML={{ __html: renderWithImageAlignment(client.thanksMessage) }} />
        }
    </div>
}
