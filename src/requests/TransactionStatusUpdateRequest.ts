export enum StatusType {
  Created = 'created',
  Submited = 'submitted',
  Aborted = 'aborted',
  Signed = 'signed',
}
export class TransactionStatusUpdateRequest {
  transactionStatus: string
}
