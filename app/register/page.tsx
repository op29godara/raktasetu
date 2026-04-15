import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-red-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-2xl p-6 md:p-8">
        <h1 className="text-3xl font-bold text-center text-red-700">
          Donor Registration
        </h1>
        <p className="text-center text-gray-600 mt-2 mb-8">
          Join RaktaSetu and become a lifesaver.
        </p>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input
              type="text"
              placeholder="Enter full name"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Mobile Number</label>
            <input
              type="tel"
              placeholder="Enter mobile number"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Blood Group</label>
            <select className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500">
              <option value="">Select blood group</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input
              type="text"
              placeholder="Enter city"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Address</label>
            <textarea
              rows={4}
              placeholder="Enter address"
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
            ></textarea>
          </div>

          <div className="md:col-span-2 flex items-start gap-2">
            <input type="checkbox" id="available" className="mt-1" />
            <label htmlFor="available" className="text-sm text-gray-700">
              I am available for emergency donation
            </label>
          </div>

          <div className="md:col-span-2">
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold"
            >
              Register as Donor
            </button>
          </div>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-red-600 font-medium hover:underline">
            Login
          </Link>
        </p>
      </div>
    </main>
  );
}
