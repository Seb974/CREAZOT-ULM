"use client"

import { isDefined } from "../lib/utils";
import Image from 'next/image';
import { CircularProgress } from '@mui/material';
import { useEffect, useState } from "react";

interface Query extends URLSearchParams {
  page?: number|string|undefined;
  author?: string|undefined;
  title?: string|undefined;
  condition?: string|undefined;
  "condition[]"?: string|string[]|undefined;
  "order[title]"?: string|undefined;
}

interface Props {
  searchParams: Query;
}

export default function Page({ searchParams }: Props) {

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(false);
  const name = isDefined(searchParams) && isDefined(searchParams['firstname']) ?  String(searchParams['firstname']).charAt(0).toUpperCase() + String(searchParams['firstname']).slice(1) : '';

  useEffect(() => {
    const fetchClient = async () => {
      try {
        setLoading(true);
        const response = await fetch('/clients');
        if (!response.ok)
          throw new Error('Erreur réseau : ' + response.status);
  
        const data = await response.json();
        setClient(data['hydra:member'][0]);
      } catch (error) {
        console.error('Erreur lors de la récupération des clients :', error);
      } finally {
        setLoading(false);
      }
    };
    fetchClient();
  }, []);

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
            img.parentNode.insertBefore(wrapper, img);
            wrapper.appendChild(img);
        } else if (align === 'right') {
            img.classList.add('img-align-right');
        } else if (align === 'left') {
            img.classList.add('img-align-left');
        }
    });

    return renderWithVariables(doc.body.innerHTML);
}

const renderWithVariables = (html) => {
  return html.replace(/{{FIRSTNAME}}/g, name);
}

  return loading ? 
      <div className="mt-6 flex justify-center items-center w-full h-full">
          <CircularProgress color="error" size={50} />
      </div>
    :
    <div className="text-center mx-2">
        {/* <h2 className="mt-6 mb-4 text-6xl font-semibold text-red-500">Merci { name } !</h2> */}
        { isDefined(client) && isDefined(client.thanksMessage) &&
          <div dangerouslySetInnerHTML={{ __html: renderWithImageAlignment(client.thanksMessage) }} />
        }
    </div>
}
