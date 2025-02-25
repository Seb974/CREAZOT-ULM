// 'use server';

import { z } from 'zod';
import axios from 'axios';
import { post, get, API_DOMAIN } from './api';;
import { RedirectType, redirect } from 'next/navigation';
import { toast } from 'react-hot-toast';
 
const FormSchema = z.object({
  id: z.number(),
  nom: z.string({
    invalid_type_error: 'Entrez votre nom de famille s\'il vous plaît.',
  }),
  prenom: z.string({
    invalid_type_error: 'Entrez votre prénom s\'il vous plaît.',
  }),
  email: z.string({
    invalid_type_error: 'Entrez votre adresse email s\'il vous plaît.',
  }),
  telephone: z.string({
    invalid_type_error: 'Entrez votre numéro de téléphone s\'il vous plaît.',
  }),
  date: z.date(),
});

export type State = {
    errors?: {
      nom?: string[];
      prenom?: string[];
      email?: string[];
      telephone?: string[];
    };
    message?: string | null;
  }
 
const CreatePassenger = FormSchema.omit({ id: true, date: true });

export async function createPassenger(prevState: State, formData: FormData) {

    const validatedFields = CreatePassenger.safeParse({
        nom: formData.get('lastname'),
        prenom: formData.get('name'),
        email: formData.get('email'),
        telephone: formData.get('phone')
    });

    if (!validatedFields.success) {
        return {
          errors: validatedFields.error.flatten().fieldErrors,
          message: 'Des informations sont manquantes. La création du passager n\'a pas pu aboutir.',
        };
    }

    const { nom, prenom, email, telephone } = validatedFields.data;
    const date = new Date().toISOString().split('T')[0];
    try {
        await post('/passagers', {nom, prenom, email, telephone, date})
        toast.success(`Merci ${prenom}. Bon vol à vous !`, {duration: 3000})
    } catch (error) {
      const violations = error.response.data.violations || [];
      const message = violations.length <= 1 ? 'Une erreur bloque la validation.' : 'Des erreurs bloquent la validation.';
      const errors = violations.reduce((a, v) => ({ ...a, [v.propertyPath]: v.message}), {});
      toast.error(message, {duration: 3000})
      return {message, errors};
    }

    redirect(`${API_DOMAIN}`!, RedirectType.replace);
}

export const getMetarOrTaf = (icao, request = "metar", decoded = false) => {

  const config = { 
      method: 'get',
      url: `https://api.checkwx.com/${ request }/${ icao }${ decoded && '/decoded' }`,
      headers: { 'X-API-Key': '2643ee8e1e864bfb9a13c98b4b' }
  };
  return axios(config)
          .then(function (response) {
            console.log(JSON.stringify(response.data));
            return response.data;
          })
          .catch(function (error) {
            console.log(error);
          });

};