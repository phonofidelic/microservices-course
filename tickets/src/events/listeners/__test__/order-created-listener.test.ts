import { OrderCreatedEvent, OrderStatus } from "@phonotickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { OrderCreatedListener } from "../order-created-listener";

const setup = async () => {
  /** Create an instance of the listener */
  const listener = new OrderCreatedListener(natsWrapper.client);

  /** Create and save a ticket */
  const ticket = Ticket.build({
    title: "Test Ticket",
    price: 20,
    userId: "abc123",
  });
  await ticket.save();

  /** Create a fake data event */
  const data: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    userId: "123abc",
    expiresAt: "fg34wrfew2tf",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
    version: 0,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("sets the userId of the ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes a ticket updated event", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();

  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );

  expect(data.id).toEqual(ticketUpdatedData.orderId);
});
