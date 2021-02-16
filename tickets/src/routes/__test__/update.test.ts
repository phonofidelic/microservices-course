import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { natsWrapper } from "../../nats-wrapper";
import { Ticket } from "../../models/ticket";

it("returns 404 if the provided ID does not exist", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .set("Cookie", global.signin())
    .send({
      title: "Test Ticket",
      price: 20,
    })
    .expect(404);
});

it("returns 401 if the user is not authenticated", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: "Test Ticket",
      price: 20,
    })
    .expect(401);
});

it("returns 401 if the user does not own the ticket", async () => {
  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: `Test Ticket`, price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", global.signin())
    .send({ title: "New Title", price: 50 })
    .expect(401);
});

it("returns 400 if the user provides invalid inputs", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: `Test Ticket`, price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "", price: 20 })
    .expect(400);

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Test Ticket", price: -10 })
    .expect(400);
});

it("updates the ticket if the user is authenticated and provides valid inputs", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: `Test Ticket`, price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Updated Ticket", price: 10 })
    .expect(200);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send();

  expect(ticketResponse.body.title).toEqual("Updated Ticket");
  expect(ticketResponse.body.price).toEqual(10);
});

it("publishes an event", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: `Test Ticket`, price: 20 });

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Updated Ticket", price: 10 })
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("rejects updates if the ticket is reserved", async () => {
  const cookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", cookie)
    .send({ title: `Test Ticket`, price: 20 });

  const ticket = await Ticket.findById(response.body.id);
  ticket!.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket!.save();

  await request(app)
    .put(`/api/tickets/${response.body.id}`)
    .set("Cookie", cookie)
    .send({ title: "Updated Ticket", price: 10 })
    .expect(400);
});
