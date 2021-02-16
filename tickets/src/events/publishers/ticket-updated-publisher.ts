import { Publisher, Subjects, TicketUpdatedEvent } from "@phonotickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
