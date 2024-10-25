'use client';

import { CustomerField } from '../../app/lib/definitions';
import Link from 'next/link';
import {
  CheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserCircleIcon,
  UserGroupIcon,
  AtSymbolIcon,
  PhoneIcon,
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { Button } from '../common/ui/button';
import { createPassenger } from '../../app/lib/actions';
import { useFormState } from 'react-dom';

export default function Form() {

  const initialState = { message: null, errors: {} };
  const [state, dispatch] = useFormState(createPassenger, initialState);

  return (
    <form action={dispatch}>
      <div className="rounded-md bg-gray-50 p-4 md:p-6">

        {/* Lastname */}
        <div className="mb-4">
          <label htmlFor="lastname" className="mb-2 block text-sm font-medium">
            Nom
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="lastname"
                name="lastname"
                type="text"
                placeholder="Entrez votre nom de famille"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <UserGroupIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          { state.errors && state.errors.nom && 
              <p className="form-error-message">
                { state.errors.nom }
              </p>
             }
        </div>

        {/* name */}
        <div className="mb-4">
          <label htmlFor="name" className="mb-2 block text-sm font-medium">
            Prénom
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                placeholder="Entrez votre prénom"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <UserCircleIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            { state.errors && state.errors.prenom && 
              <p className="form-error-message">
                { state.errors.prenom }
              </p>
             }
          </div>
        </div>

        {/* email */}
        <div className="mb-4">
          <label htmlFor="email" className="mb-2 block text-sm font-medium">
            E-mail
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="email"
                name="email"
                type="text"
                // type="email"
                placeholder="Entrez votre adresse e-mail"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <AtSymbolIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
            { state.errors && state.errors.email && 
              <p className="form-error-message">
                { state.errors.email }
              </p>
             }
          </div>
        </div>

        {/* phone */}
        <div className="mb-4">
          <label htmlFor="phone" className="mb-2 block text-sm font-medium">
            Téléphone
          </label>
          <div className="relative mt-2 rounded-md">
            <div className="relative">
              <input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Entrez votre N° de téléphone"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500"
              />
              <PhoneIcon className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900" />
            </div>
          </div>
          { state.errors && state.errors.telephone && 
              <p className="form-error-message">
                { state.errors.telephone }
              </p>
             }
        </div>

      </div>
      <div className="mt-6 flex justify-end gap-4">
        {/* <Link
          href="/dashboard/invoices"
          className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
        >
          Cancel
        </Link> */}
        <Button type="submit" className="flex h-10 items-center rounded-lg bg-red-500 px-4 text-sm font-medium text-white transition-colors hover:bg-red-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-500 active:bg-red-600 aria-disabled:cursor-not-allowed aria-disabled:opacity-50">
            <PaperAirplaneIcon className=" h-[18px] w-[18px] text-white mr-2"/>
            Envoyer
        </Button>
      </div>
    </form>
  );
}
