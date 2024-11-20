const request = require('supertest');
const { app, server, db } = require('../server'); // Ruta a tu servidor Express
const userTest = process.env.TEST_USER;
const userPass = process.env.PASS_TEST_USER;
const wrongPass = process.env.WRONG_PASS_TEST_USER

describe("POST /login", () => {
  afterAll(async () => {
    server.close();
    await db.end(); // Cierra el servidor y la conexión a la base de datos
  });

  it("Debe devolver un mensaje de éxito si el usuario y la contraseña son correctos", async () => {

    const response = await request(app)
      .post("/login")
      .send({ email: userTest, password: userPass });

    expect(response.body.message).toBe("Inicio de sesión exitoso.");
  });

  it("Debe devolver un error 400 si el usuario no está registrado", async () => {

    const response = await request(app)
      .post("/login")
      .send({ email: "noexiste@example.com", password: wrongPass });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Usuario no registrado");
  });

  it("Debe devolver un error 400 si la contraseña es incorrecta", async () => {

    const response = await request(app)
      .post("/login")
      .send({ email: userTest, password: wrongPass });

    expect(response.status).toBe(400);
    expect(response.text).toBe("Contraseña incorrecta");
  });
});
