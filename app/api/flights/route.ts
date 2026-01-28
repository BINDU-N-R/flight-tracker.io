import { NextResponse } from 'next/server';
import { fetchFlightData } from '@/lib/aviation-stack';

export interface Flight {
    flightNumber: string;
    airline: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    status: string;
}

const MOCK_FLIGHTS: Flight[] = [
    {
        flightNumber: 'AA123',
        airline: 'American Airlines',
        origin: 'JFK (New York)',
        destination: 'LHR (London)',
        departureTime: '2023-11-01T18:00:00-04:00',
        arrivalTime: '2023-11-02T06:00:00+00:00',
        status: 'On Time',
    },
    {
        flightNumber: 'UA456',
        airline: 'United Airlines',
        origin: 'SFO (San Francisco)',
        destination: 'NRT (Tokyo)',
        departureTime: '2023-11-05T11:00:00-08:00',
        arrivalTime: '2023-11-06T15:00:00+09:00',
        status: 'Delayed',
    },
    {
        flightNumber: 'BA789',
        airline: 'British Airways',
        origin: 'LHR (London)',
        destination: 'JFK (New York)',
        departureTime: '2023-11-10T10:00:00+00:00',
        arrivalTime: '2023-11-10T13:00:00-05:00',
        status: 'Scheduled',
    },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const flightNumber = searchParams.get('flightNumber');

    if (!flightNumber) {
        return NextResponse.json(
            { error: 'Flight number is required' },
            { status: 400 }
        );
    }

    // Fallback to mock data if key is missing or default
    if (!process.env.AVIATION_STACK_ACCESS_KEY || process.env.AVIATION_STACK_ACCESS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        console.warn('Using MOCK data because AVIATION_STACK_ACCESS_KEY is missing');
        return getMockFlight(flightNumber);
    }

    try {
        const flightData = await fetchFlightData(flightNumber);

        if (flightData) {
            const flight: Flight = {
                flightNumber: flightData.flight.iata || flightData.flight.number,
                airline: flightData.airline.name,
                origin: `${flightData.departure.iata} (${flightData.departure.airport})`,
                destination: `${flightData.arrival.iata} (${flightData.arrival.airport})`,
                departureTime: flightData.departure.scheduled,
                arrivalTime: flightData.arrival.scheduled,
                status: flightData.flight_status.charAt(0).toUpperCase() + flightData.flight_status.slice(1),
            };

            return NextResponse.json([flight]);
        } else {
            // If API returns nothing, maybe check mock data? (Optional, but let's stick to API truth if key is present)
            return NextResponse.json(
                { error: 'Flight not found' },
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Error in flight API, falling back to mock:', error);
        return getMockFlight(flightNumber);
    }
}

function getMockFlight(flightNumber: string) {
    const flight = MOCK_FLIGHTS.find(
        (f) => f.flightNumber.toLowerCase() === flightNumber.toLowerCase()
    );

    if (flight) {
        return NextResponse.json([flight]);
    } else {
        return NextResponse.json(
            { error: 'Flight not found' },
            { status: 404 }
        );
    }
}
