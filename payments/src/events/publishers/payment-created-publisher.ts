import { PaymentCreatedEvent, Publisher, Subjects } from "@phonotickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
