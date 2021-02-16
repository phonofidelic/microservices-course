import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { Ticket } from "../../models/ticket";

it("fetches the order", async () => {
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

  /** Make a request to fetch the order */
  const { body: fetchedOrder } = await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", user)
    .expect(200);

  expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if the user does not own the requested order", async () => {
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

  /** Make a request to fetch the order */
  await request(app)
    .get(`/api/orders/${order.id}`)
    .set("Cookie", global.signin())
    .expect(401);
});
