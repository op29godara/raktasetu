import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-red-50 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl text-center bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-4xl md:text-5xl font-bold text-red-700">
          RaktaSetu
        </h1>
        <p className="mt-4 text-lg text-gray-700">
          Ek Boond, Ek Jeevan
        </p>
        <p className="mt-2 text-gray-600">
          Smart blood donation app for donors and emergency seekers.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/login"
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Login
          </Link>

          <Link
            href="/signup"
            className="bg-white border border-red-600 text-red-600 hover:bg-red-50 px-6 py-3 rounded-lg font-semibold"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}
