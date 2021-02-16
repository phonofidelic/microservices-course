import { TicketUpdatedEvent } from "@phonotickets/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../../models/ticket";
import { natsWrapper } from "../../../nats-wrapper";
import { TicketUpdatedListener } from "../ticket-updated-listener";

const setup = async () => {
  /** Create a listener */
  const listener = new TicketUpdatedListener(natsWrapper.client);

  /** Create and save a ticket */
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Test Ticket",
    price: 20,
  });
  await ticket.save();

  /** Create a fake data object */
  const data: TicketUpdatedEvent["data"] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: "Updated Ticket",
    price: 10,
    userId: "123abc",
  };

  /** Create a fake message object */
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, ticket, data, msg };
};

it("finds, updates and saves a ticket", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(data.title);
  expect(updatedTicket!.price).toEqual(data.price);
  expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message", async () => {
  const { listener, ticket, data, msg } = await setup();

  await listener.onMessage(data, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("does not call ack if the event version is not successive", async () => {
  const { listener, ticket, data, msg } = await setup();

  data.version = 10;

  await expect(listener.onMessage(data, msg)).rejects.toThrow();
  expect(msg.ack).not.toHaveBeenCalled();
});
