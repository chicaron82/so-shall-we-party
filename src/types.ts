export type BatchType = 'range' | 'card';

export interface TicketBatch {
  id: string;
  label: string;
  type: BatchType;
  prize?: string;
  // range batch
  rangeStart?: number;
  rangeEnd?: number;
  // card batch
  number?: number;
  quantity?: number;
}

export interface DrawnTicket {
  id: string;
  number: number;
  drawnAt: string;
  batchId: string;
  batchLabel: string;
  prize?: string;
  claimed: boolean;
}

export interface Event {
  id: string;
  name: string;
  date: string;
  photo?: string; // base64
  batches: TicketBatch[];
  draws: DrawnTicket[];
  createdAt: string;
}

export interface LookupResult {
  found: boolean;
  batch?: TicketBatch;
  matchedNumber?: number;
}
