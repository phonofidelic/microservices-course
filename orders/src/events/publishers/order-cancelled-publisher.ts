import { Publisher, Subjects, OrderCancelledEvent } from "@phonotickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
