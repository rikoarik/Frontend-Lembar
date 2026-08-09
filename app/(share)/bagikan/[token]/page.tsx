import { redirect } from 'next/navigation';
export default async function LegacyShare({params}:{params:Promise<{token:string}>}){const {token}=await params;redirect(`/attempt/${encodeURIComponent(token)}`)}
