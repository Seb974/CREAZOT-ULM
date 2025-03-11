
import { useEffect } from "react";
import { isDefined } from "../lib/utils";
import Image from 'next/image'

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


export default async function Page({ searchParams }: Props) {


  const name = isDefined(searchParams) && isDefined(searchParams['firstname']) ?  String(searchParams['firstname']).charAt(0).toUpperCase() + String(searchParams['firstname']).slice(1) : ''

  return (
    <div className="text-center mx-2">
        <h2 className="mt-6 mb-4 text-6xl font-semibold text-red-500">Merci { name } !</h2>
        <p className="mb-6 text-lg text-gray-600">Bon vol à vous avec Planetair974.<br/><br/></p>
        

        <div className="animate-bounce flex justify-center mt-6">
          {/* <svg className="mx-auto h-16 w-16 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
          </svg> */}
          <Image
              className="text-center"
              src="/images/Plane.png"
              alt="Planetair974 Aircraft"
              width={556}
              height={356}
            />
        </div>
        <p className="mt-4 text-gray-600">Votre vol vous a plu ? <br/>Faites-le savoir sur <a href="https://www.tripadvisor.fr/Attraction_Review-g298471-d3558149-Reviews-Planetair974-Saint_Pierre_Arrondissement_of_Saint_Pierre.html" className="text-blue-500">TripAdvisor</a> !</p>
    </div>
  );
}
