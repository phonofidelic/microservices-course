import { Publisher, Subjects, OrderCreatedEvent } from "@phonotickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
