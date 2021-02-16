import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@phonotickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
