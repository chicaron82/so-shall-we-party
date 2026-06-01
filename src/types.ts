export type BatchType = 'range' | 'card';

export interface TicketBatch {
  id: string;
  notes?: string; // optional free text — prize info, e.g. "winner picks any bottle"
  type: BatchType;
  prize?: string;
  // range batch
  rangeStart?: number;
  rangeEnd?: number;
  // card batch (silent-auction sheet — one number, printed many times; count is irrelevant to the draw)
  number?: number;
}

export interface DrawnTicket {
  id: string;
  number: number;
  drawnAt: string;
  batchId: string;
  batchName: string;  // auto display name captured at draw time (batch may change later)
  prize?: string;
  notes?: string;
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
