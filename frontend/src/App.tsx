import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import CSSimulation from "./pages/CSSimulation";

/**
 * Komponen untuk halaman 404 Not Found yang lebih profesional.
 */
const NotFound = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100 text-slate-700 font-sans p-4">
    <div className="text-center">
      {/* Ikon SVG untuk visual */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="mx-auto h-24 w-24 text-sky-500 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h1 className="text-6xl font-extrabold text-sky-700">404</h1>
      <p className="text-2xl font-semibold mt-2 text-slate-800">Halaman Tidak Ditemukan</p>
      <p className="mt-4 text-slate-500">
        Maaf, kami tidak dapat menemukan halaman yang Anda cari.
      </p>
      <Link
        to="/"
        className="mt-8 inline-block bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition-transform transform hover:-translate-y-1"
      >
        Kembali ke Halaman Utama
      </Link>
    </div>
  </div>
);

/**
 * Komponen utama aplikasi yang mengatur semua routing.
 */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CSSimulation />} />
        {/* Rute ini akan menangkap semua path yang tidak cocok */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}