import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { openTry } from "@/v3/TrySheet";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-4">
        <div className="v3-brackets relative w-full border border-night-hair bg-night-deck p-8 md:p-10">
          <div className="v3-eyebrow mb-4 flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" /> 404 · off the map</div>
          <h1 className="mb-3 text-3xl font-semibold text-gray-900 md:text-4xl">Nothing lives at <span className="v3-mono break-all text-xl text-gray-600 md:text-2xl">{location.pathname}</span></h1>
          <p className="mb-8 text-gray-600">The page moved or never existed. Here&rsquo;s where most people were headed.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link to="/" className="v3-btn v3-btn-aurora">Home <ArrowRight size={16} /></Link>
            <Link to="/demos" className="v3-btn v3-btn-ghost">All live demos</Link>
            <button onClick={() => openTry()} className="v3-btn v3-btn-ghost">Try it on my company</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
