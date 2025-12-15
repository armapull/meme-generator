import { init, id } from '@instantdb/react';
import schema from '@/instant.schema';

const appId = process.env.NEXT_PUBLIC_INSTANT_APP_ID || '5509502a-a3f4-4057-9d8b-3c2d4498ad10';

export const db = init({ appId, schema });
export { id };
