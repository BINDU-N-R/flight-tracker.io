'use server';

import { fetchFlightData } from '@/lib/aviation-stack';

export async function getFlight(flightNumber: string) {
    return await fetchFlightData(flightNumber);
}
