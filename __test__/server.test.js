const request = require("supertest");
const { app, server, db } = require("../server"); // Ruta a tu servidor Express

// Datos del usuario de prueba
const testUser = {
  name: "Name",
  last_name: "Lastname",
  email: "testuser@example.com",
  phone: "1234567890",
  password: process.env.TEST_USER_PASSWORD,
};

// Limpieza al finalizar las pruebas
afterAll(async () => {
  await db.query("DELETE FROM users WHERE email = ?", [testUser.email]); // Limpieza
  server.close();
  await db.end(); // Cierra la conexión a la base de datos
});

//Pruebas ruta para registrar usuario
describe("POST /register", () => {
  it("Debe devolver un mensaje de éxito si los datos son válidos y el usuario no existe", async () => {
    const response = await request(app).post("/register").send(testUser);

    expect(response.status).toBe(201);
    expect(response.body.message).toBe("Usuario registrado exitosamente");
  });

  it("Debe devolver un error 400 si faltan datos", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...testUser, email: undefined });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Por favor ingrese todos los datos");
  });

  it("Debe devolver un error 400 si el usuario ya está registrado", async () => {
    const response = await request(app).post("/register").send(testUser);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("El usuario ya está registrado");
  });

  it("Debe devolver un error 400 si el email ya está en uso", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...testUser, phone: "0987654321" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("El correo electrónico ya está en uso");
  });

  it("Debe devolver un error 400 si el número telefónico ya está en uso", async () => {
    const response = await request(app)
      .post("/register")
      .send({ ...testUser, email: "nuevoemail@example.com" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("El número telefónico ya está en uso");
  });

  it("Debe devolver un error 500 si hay un problema en el servidor", async () => {
    jest.spyOn(db, "query").mockImplementationOnce(() => {
      throw new Error("Error simulado");
    });

    const response = await request(app).post("/register").send(testUser);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error en el servidor");

    db.query.mockRestore();
  });
});

//Pruebas ruta login
describe("POST /login", () => {
  it("Debe devolver un mensaje de éxito si el usuario y la contraseña son correctos", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: testUser.email, password: testUser.password });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Inicio de sesión exitoso.");
  });

  it("Debe devolver un error 400 si el usuario no está registrado", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: "noexiste@example.com", password: process.env.WRONG_PASS_TEST_USER });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Usuario no registrado");
  });

  it("Debe devolver un error 400 si la contraseña es incorrecta", async () => {
    const response = await request(app)
      .post("/login")
      .send({ email: testUser.email, password: process.env.WRONG_PASS_TEST_USER });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Contraseña incorrecta");
  });
});

//Prueba ruta para consultar los datos del usuario
describe("GET /user/:email", () => {
  it("Debe devolver los datos del usuario si el email existe", async () => {
    const response = await request(app).get(`/user/${testUser.email}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      name: testUser.name,
      last_name: testUser.last_name,
      email: testUser.email,
      phone: testUser.phone,
    });
  });

  it("Debe devolver un error 404 si el usuario no existe", async () => {
    const response = await request(app).get(`/user/noexiste@example.com`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("El usuario no fue encontrado");
  });

  it("Debe devolver un error 500 si ocurre un error en el servidor", async () => {
    jest.spyOn(db, "query").mockImplementationOnce(() => {
      throw new Error("Error simulado");
    });

    const response = await request(app).get(`/user/${testUser.email}`);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error en el servidor");

    db.query.mockRestore();
  });
});

//Prueba ruta editar perfil
describe("POST /edit", () => {
  const updatedUser = {
    name: "UpdatedName",
    last_name: "UpdatedLastName",
    email: testUser.email,
    phone: "0987654321",
    password: process.env.NEW_TEST_USER_PASS,
  };

  it("Debe actualizar los datos del usuario si los datos son válidos", async () => {
    const response = await request(app).post("/edit").send(updatedUser);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Usuario actualizado exitosamente");

    // Verificar que los datos se actualizaron correctamente en la base de datos
    const [results] = await db.query(
      "SELECT name, last_name, email, phone FROM users WHERE email = ?",
      [updatedUser.email]
    );

    expect(results[0]).toEqual({
      name: updatedUser.name,
      last_name: updatedUser.last_name,
      email: updatedUser.email,
      phone: updatedUser.phone,
    });
  });

  it("Debe devolver un error 400 si faltan campos obligatorios", async () => {
    const response = await request(app)
      .post("/edit")
      .send({ ...updatedUser, phone: undefined });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Todos los campos son obligatorios");
  });

  it("Debe devolver un error 404 si el usuario no existe", async () => {
    const response = await request(app).post("/edit").send({
      ...updatedUser,
      email: "noexiste@example.com",
    });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("No fue encontrado el usuario");
  });

  it("Debe devolver un error 500 si ocurre un problema en el servidor", async () => {
    jest.spyOn(db, "query").mockImplementationOnce(() => {
      throw new Error("Error simulado");
    });

    const response = await request(app).post("/edit").send(updatedUser);

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Error en el servidor");

    db.query.mockRestore();
  });
});