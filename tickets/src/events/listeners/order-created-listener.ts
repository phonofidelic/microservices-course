import { Message } from "node-nats-streaming";
import { Listener, OrderCreatedEvent, Subjects } from "@phonotickets/common";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/ticket";
import { TicketUpdatedPublisher } from "../publishers/ticket-updated-publisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    /** Find the ticket that the order is reserving */
    const ticket = await Ticket.findById(data.ticket.id);

    /** If not found, throw error */
    if (!ticket) {
      throw new Error("Ticket not found");
    }

    /** Mark the ticket as reserved by setting its orderId property */
    ticket.set({ orderId: data.id });
    await ticket.save();

    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
      version: ticket.version,
      orderId: ticket.orderId,
    });

    msg.ack();
  }
}
