export default function Page() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <div className="text-center max-w-md px-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Planetair Gestion</h1>
        <p className="text-lg text-gray-500 mb-8">Votre solution de gestion pour aéroclubs ULM</p>
        <div className="flex flex-col gap-4">
          <a
            href="/admin"
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium shadow-md"
          >
            Accéder à votre espace
          </a>
        </div>
        <p className="mt-10 text-sm text-gray-400">
          Si vous êtes passager, demandez le lien direct à votre aéroclub.
        </p>
      </div>
    </div>
  );
}
