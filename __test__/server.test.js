const request = require('supertest');
const { app, closeServer } = require('../server'); // Ruta a tu servidor Express

describe("POST /login", () => {
  afterAll(async () => {
    await closeServer(); // Cierra el servidor y la conexión a la base de datos
  });

  it("Debe devolver un mensaje de éxito si el usuario y la contraseña son correctos", async () => {

    const response = await request(app)
      .post("/login")
      .send({ email: "felipe@gmail.com", password: "1234" });

    expect(response.body.message).toBe("Inicio de sesión exitoso.");
  });

  it("Debe devolver un error 400 si el usuario no está registrado", async () => {

    const response = await request(app)
      .post("/login")
      .send({ email: "noexiste@example.com", password: "password123" });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Usuario no registrado");
  });

  it("Debe devolver un error 400 si la contraseña es incorrecta", async () => {

    const response = await request(app)
      .post("/login")
      .send({ email: "felipe@gmail.com", password: "wrongpassword" });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Contraseña incorrecta");
  });
});
