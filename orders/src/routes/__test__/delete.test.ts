import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";
import { Order, OrderStatus } from "../../models/order";
import { natsWrapper } from "../../nats-wrapper";

it("marks an order as canceled", async () => {
  /** Create the ticket */
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Test Ticket",
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  /** Make a request to build an order with this ticket */
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  /** Make a request to cancel the order */
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  const canceledOrder = await Order.findById(order.id);

  expect(canceledOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("emits an order canceled event", async () => {
  /** Create the ticket */
  const ticket = Ticket.build({
    id: mongoose.Types.ObjectId().toHexString(),
    title: "Test Ticket",
    price: 20,
  });
  await ticket.save();

  const user = global.signin();
  /** Make a request to build an order with this ticket */
  const { body: order } = await request(app)
    .post("/api/orders")
    .set("Cookie", user)
    .send({ ticketId: ticket.id })
    .expect(201);

  /** Make a request to cancel the order */
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
