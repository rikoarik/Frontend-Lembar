import { NextResponse,type NextRequest } from 'next/server';
import { backendFetch } from '@/src/lib/api/session';
export async function POST(request:NextRequest,{params}:{params:Promise<{token:string}>}){const {token}=await params;const upstream=await backendFetch(`/v1/public/shares/${encodeURIComponent(token)}/attempts`,{method:'POST',body:await request.text()});return new NextResponse(await upstream.text(),{status:upstream.status,headers:{'content-type':upstream.headers.get('content-type')??'application/json'}})}
