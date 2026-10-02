import {speedTestResponse} from '../../../lib/speed-api';
export const maxDuration=120;
export async function POST(request:Request){return speedTestResponse(request);}
