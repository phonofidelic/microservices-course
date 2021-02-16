import { Listener, OrderCancelledEvent, Subjects } from "@phonotickets/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
    /** Find the ticket that the order is reserving */
    const ticket = await Ticket.findById(data.ticket.id);

    /** If not found, throw error */
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    /** Release the ticket by removing its orderId property */
    ticket.set({ orderId: undefined });
    await ticket.save();

    /** Publish the ticket:updated event */
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    /** Acknowledge the order:cancelled event */
    msg.ack();
  }
}
