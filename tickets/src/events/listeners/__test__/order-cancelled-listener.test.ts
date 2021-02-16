import mongoose from "mongoose";
import { OrderCancelledEvent } from "@phonotickets/common";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCancelledListener } from "../order-cancelled-listener";
import { Message } from "node-nats-streaming";

const setup = async () => {
  /** Create an instance of the listener */
  const listener = new OrderCancelledListener(natsWrapper.client);

  /** Create and save a ticket */
  const orderId = mongoose.Types.ObjectId().toHexString();
  const ticket = Ticket.build({
    title: "Test Ticket",
    price: 20,
    userId: "abc123",
  });
  ticket.set({ orderId });
  await ticket.save();

  /** Create a fake data event */
  const data: OrderCancelledEvent["data"] = {
    id: orderId,
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, orderId, data, msg };
};

it("releases the ticket by removing its orderId property", async () => {
  const { listener, orderId, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(data.ticket.id);
  expect(updatedTicket!.orderId).not.toBeDefined();
});

it("publishes the ticket:updated event", async () => {
  const { listener, orderId, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(data.ticket.id).toEqual(ticketUpdatedData.id);
});

it("acknowledge the order:cancelled event", async () => {
  const { listener, orderId, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});
