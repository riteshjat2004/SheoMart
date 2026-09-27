import { Schema, model, Document } from "mongoose";

export interface ITicketCounter extends Document {
  year: number;
  seq: number;
}

const ticketCounterSchema = new Schema<ITicketCounter>(
  {
    year: {
      type: Number,
      required: true,
      unique: true,
    },
    seq: {
      type: Number,
      default: 0,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const TicketCounter = model<ITicketCounter>(
  "TicketCounter",
  ticketCounterSchema
);
