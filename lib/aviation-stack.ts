export interface AviationStackPagination {
    limit: number;
    offset: number;
    count: number;
    total: number;
}

export interface AviationStackDeparture {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    delay: number | null;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
}

export interface AviationStackArrival {
    airport: string;
    timezone: string;
    iata: string;
    icao: string;
    terminal: string;
    gate: string;
    baggage: string | null;
    delay: number | null;
    scheduled: string;
    estimated: string;
    actual: string | null;
    estimated_runway: string | null;
    actual_runway: string | null;
}

export interface AviationStackAirline {
    name: string;
    iata: string;
    icao: string;
}

export interface AviationStackFlightInfo {
    number: string;
    iata: string;
    icao: string;
    codeshared: unknown | null;
}

export interface AviationStackFlightData {
    flight_date: string;
    flight_status: 'scheduled' | 'active' | 'landed' | 'cancelled' | 'incident' | 'diverted';
    departure: AviationStackDeparture;
    arrival: AviationStackArrival;
    airline: AviationStackAirline;
    flight: AviationStackFlightInfo;
    aircraft: unknown | null;
    live: unknown | null;
}

export interface AviationStackResponse {
    pagination: AviationStackPagination;
    data: AviationStackFlightData[];
}

export async function fetchFlightData(flightNumber: string): Promise<AviationStackFlightData | null> {
    const accessKey = process.env.AVIATION_STACK_ACCESS_KEY;

    if (!accessKey) {
        throw new Error('AVIATION_STACK_ACCESS_KEY is not configured');
    }

    // Aviation Stack expects flight_iata (e.g. AA1004) or flight_icao (e.g. AAL1004).
    // The user input is likely one of these. We'll pass it as flight_iata first as it's most common for consumer search.
    // Note: The docs say "flight_number" is just the number part (1004). 
    // Let's assume the user enters "AA1004".

    const url = new URL('http://api.aviationstack.com/v1/flights');
    url.searchParams.append('access_key', accessKey);
    url.searchParams.append('flight_iata', flightNumber);
    url.searchParams.append('limit', '1'); // We only need the most relevant one

    try {
        const res = await fetch(url.toString(), {
            // Revalidate every minute so we get somewhat fresh data but don't spam the API on reload
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            console.error('Failed to fetch flight data:', res.status, res.statusText);
            return null;
        }

        const data: AviationStackResponse = await res.json();

        if (data.data && data.data.length > 0) {
            return data.data[0];
        }

        return null;
    } catch (error) {
        console.error('Error fetching flight data:', error);
        return null;
    }
}
