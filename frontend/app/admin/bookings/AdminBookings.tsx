"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api";

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    const bookings = await apiClient.getBookings();
    setBookings(bookings);
  }

  async function approve(id: string) {
    await apiClient.approveBooking(id);
    fetchBookings(); // refresh table
  }

  async function reject(id: string) {
    await apiClient.rejectBooking(id);
    fetchBookings(); // refresh table
  }

  function getStatus(b: any) {
    if (b.cancelled) return "Cancelled";
    if (b.approved) return "Approved";
    if (b.rejected) return "Rejected";
    return "Pending";
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Consultation Bookings</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Client</th>
            <th className="p-2 border">Email</th>
            <th className="p-2 border">Start</th>
            <th className="p-2 border">End</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b: any) => (
            <tr key={b.booking_id}>
              <td className="p-2 border">{b.name}</td>
              <td className="p-2 border">{b.email}</td>
              <td className="p-2 border">{b.start_time}</td>
              <td className="p-2 border">{b.end_time}</td>

              <td className="p-2 border font-medium">
                {getStatus(b)}
              </td>

              <td className="p-2 border space-x-2">
                {/* Approve Button */}
                <button
                  onClick={() => approve(b.booking_id)}
                  disabled={b.approved || b.rejected || b.cancelled}
                  className={`px-3 py-1 rounded text-white ${
                    b.approved || b.rejected || b.cancelled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Approve
                </button>

                {/* Reject Button */}
                <button
                  onClick={() => reject(b.booking_id)}
                  disabled={b.approved || b.rejected || b.cancelled}
                  className={`px-3 py-1 rounded text-white ${
                    b.approved || b.rejected || b.cancelled
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
