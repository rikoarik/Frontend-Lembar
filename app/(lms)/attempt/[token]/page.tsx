import type { Metadata } from 'next';
import StudentRunner from '@/src/features/lms/StudentRunner';
export const metadata: Metadata={robots:{index:false,follow:false}};
export default async function AttemptPage({params}:{params:Promise<{token:string}>}){const {token}=await params;return <StudentRunner token={token}/>}
