"use client";

import { useState } from "react";
import { Flight } from "./api/flights/route";
import { Plane, MapPin, Search, Clock } from "lucide-react";

export default function Home() {
    const [flightNumber, setFlightNumber] = useState("");
    const [flightData, setFlightData] = useState<Flight | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setFlightData(null);

        try {
            const res = await fetch(`/api/flights?flightNumber=${encodeURIComponent(flightNumber)}`);
            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error("Flight not found");
                }
                throw new Error("Failed to fetch flight data");
            }
            const data: Flight[] = await res.json();
            if (data.length > 0) {
                setFlightData(data[0]);
            } else {
                setError("Flight not found");
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const createGoogleCalendarLink = (flight: Flight) => {
        const title = `Flight ${flight.airline} ${flight.flightNumber}`;
        const start = new Date(flight.departureTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const end = new Date(flight.arrivalTime).toISOString().replace(/-|:|\.\d\d\d/g, "");
        const details = `Flight ${flight.flightNumber} from ${flight.origin} to ${flight.destination}.\nAirline: ${flight.airline}`;
        const location = flight.origin;

        return `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${start}/${end}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-blue-50/50 p-4 font-sans">
            <main className="w-full max-w-2xl flex flex-col items-center gap-8">
                {/* Header */}
                <div className="flex flex-col items-center gap-2">
                    <div className="bg-blue-600 rounded-full p-4 mb-2 shadow-lg shadow-blue-200">
                        <Plane className="w-8 h-8 text-white fill-white" />
                    </div>
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Flight Tracker
                    </h1>
                    <p className="text-gray-500 font-medium">
                        Track any flight, anytime, anywhere.
                    </p>
                </div>

                {/* Search Bar */}
                <form onSubmit={handleSearch} className="w-full relative max-w-lg">
                    <input
                        type="text"
                        value={flightNumber}
                        onChange={(e) => {
                            const value = e.target.value;
                            setFlightNumber(value);
                            if (value.trim() === "") {
                                setFlightData(null);
                                setError("");
                            }
                        }}
                        placeholder="Enter flight number"
                        className="w-full pl-6 pr-14 py-4 rounded-full border-none shadow-sm focus:ring-2 focus:ring-blue-100 outline-none text-gray-700 placeholder-gray-400 bg-white text-lg font-medium"
                        required
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Search className="w-5 h-5" />
                    </button>
                </form>

                {error && (
                    <div className="w-full max-w-lg p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center font-medium">
                        {error}
                    </div>
                )}

                {flightData && (
                    <a
                        href={createGoogleCalendarLink(flightData)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full block mt-4 hover:scale-[1.01] transition-transform duration-200"
                    >
                        <div className="w-full bg-white rounded-3xl shadow-xl shadow-blue-100/50 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Airline Header */}
                            <div className="flex items-center gap-4 mb-8">
                                <div className="bg-blue-100 p-3 rounded-full">
                                    <Plane className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">{flightData.airline}</h2>
                                    <p className="text-gray-500 font-medium">{flightData.flightNumber.replace(/\D/g, '')}</p>
                                </div>
                            </div>

                            {/* Flight Route Info */}
                            <div className="grid grid-cols-2 gap-8 relative">
                                {/* Origin */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm font-semibold uppercase tracking-wide">Origin</span>
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900">
                                        {flightData.origin.split(' ')[0]}
                                    </div>
                                    <div className="text-gray-500 text-sm font-medium">
                                        {/* Extracting city name from format "JFK (New York)" */}
                                        {flightData.origin.match(/\(([^)]+)\)/)?.[1] || flightData.origin}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 mt-2 text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        {new Date(flightData.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-gray-300">|</span>
                                        {new Date(flightData.departureTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>

                                {/* Destination */}
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                                        <MapPin className="w-4 h-4" />
                                        <span className="text-sm font-semibold uppercase tracking-wide">Destination</span>
                                    </div>
                                    <div className="text-4xl font-bold text-gray-900">
                                        {flightData.destination.split(' ')[0]}
                                    </div>
                                    <div className="text-gray-500 text-sm font-medium">
                                        {flightData.destination.match(/\(([^)]+)\)/)?.[1] || flightData.destination}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-400 mt-2 text-sm font-medium">
                                        <Clock className="w-4 h-4" />
                                        {new Date(flightData.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-gray-300">|</span>
                                        {new Date(flightData.arrivalTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </a>
                )}
            </main>
        </div>
    );
}
