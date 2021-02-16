import request from "supertest";
import { app } from "../../app";

it("returns a 200 on successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test1234",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "test1234",
    })
    .expect(200);
});

it("fails with an unused email", async () => {
  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "test1234",
    })
    .expect(400);
});

it("fails with an incorrect password", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test1234",
    })
    .expect(201);

  await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "wrongpassword",
    })
    .expect(400);
});

it("responds with a cookie on successful signin", async () => {
  await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "test1234",
    })
    .expect(201);

  const response = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "test1234",
    })
    .expect(200);

  expect(response.get("Set-Cookie")).toBeDefined();
});
