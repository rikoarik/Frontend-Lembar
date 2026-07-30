import type { Metadata } from 'next';
import { use } from 'react';
import StudentRunner from '@/src/features/lms/StudentRunner';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function AttemptPage({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = use(params);
  return <StudentRunner assessmentId={assessmentId} />;
}
