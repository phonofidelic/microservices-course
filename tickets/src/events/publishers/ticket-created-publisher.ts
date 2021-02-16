import { Publisher, Subjects, TicketCreatedEvent } from "@phonotickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
