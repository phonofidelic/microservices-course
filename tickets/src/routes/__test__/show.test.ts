import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";

it("returns 404 if the ticket is not found", async () => {
  const id = new mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("returns the ticket if it is found", async () => {
  const ticketTitle = "Test Ticket";
  const ticketPrice = 20;

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", global.signin())
    .send({ title: ticketTitle, price: ticketPrice })
    .expect(201);

  const ticketResponse = await request(app)
    .get(`/api/tickets/${response.body.id}`)
    .send()
    .expect(200);

  expect(ticketResponse.body.title).toEqual(ticketTitle);
  expect(ticketResponse.body.price).toEqual(ticketPrice);
});
