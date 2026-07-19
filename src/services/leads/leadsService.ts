import { leadsMutations } from './leadsMutations';
import { leadAcknowledgeCopy } from './errorMapping';
import type { LeadError } from './leadsErrors';
import { err, ok, type Result } from '@/src/types/result';
import type { SchoolLeadInput, SchoolLeadSuccess } from '@/src/types/leads';

export const leadsService = {
  submitSchoolLead(
    input: SchoolLeadInput,
    idempotencyKey: string,
  ): Promise<Result<SchoolLeadSuccess, LeadError>> {
    return leadsMutations.submitSchoolLead(input, idempotencyKey);
  },
};

export function leadAcknowledgeError(): LeadError {
  return {
    code: 'VALIDATION_FAILED',
    safeMessage: leadAcknowledgeCopy().safeMessage,
    retryable: false,
  };
}

export const _ok = ok;
export const _err = err;
