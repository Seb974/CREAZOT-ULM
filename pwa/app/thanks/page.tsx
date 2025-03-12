
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
        <p className="mb-6 text-lg text-gray-600">Bon vol à vous avec Planetair974.</p>
        <p className="text-sm"><i>Profitez pleinement du moment, nous nous occupons de <a href="https://drive.google.com/drive/u/3/folders/0BzOWcOCzePzTSzRLTmFVMDFPOHM?resourcekey=0-iLj4-YqX5cggqazBJQxd7A" className="text-blue-500" target="_blank" rel="noopener noreferrer">vos souvenirs de l'Île intense vue du ciel</a>.</i><br/><br/><br/><br/></p>

        <div className="animate-bounce flex justify-center mt-6">
          <Image
              className="text-center"
              src="/images/Plane.png"
              alt="Planetair974 Aircraft"
              width={556}
              height={356}
            />
        </div>
        <p className="mt-4 text-gray-600">Votre vol vous a plu ? <br/>Faites-le savoir sur <a href="https://www.tripadvisor.fr/Attraction_Review-g298471-d3558149-Reviews-Planetair974-Saint_Pierre_Arrondissement_of_Saint_Pierre.html" className="text-blue-500" target="_blank" rel="noopener noreferrer">TripAdvisor</a> et sur <a href="https://www.google.com/maps/place/Planetair974/@-21.3190806,55.4261019,17z/data=!3m1!4b1!4m6!3m5!1s0x2182a13f4362468b:0x725ef4e733adb25d!8m2!3d-21.3190806!4d55.4261019!16s%2Fg%2F1ptwhwyvy?entry=ttu&g_ep=EgoyMDI1MDMwOC4wIKXMDSoASAFQAw%3D%3D" className="text-blue-500" target="_blank" rel="noopener noreferrer">Google</a>!</p>
    </div>
  );
}
