import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect'; 
import EditProfile from "./../views/EditProfile"

jest.mock("axios");
const jwt = require("jsonwebtoken");

describe("EditProfile Component", () => {
    const mockToken = jwt.sign(
        { id: "123", email: "test@example.com", name: "Test User", role: "client" },
        "devops2", 
        { expiresIn: "1h" }
    );

    beforeEach(() => {
        // Optionally set up local storage for userEmail if needed
        localStorage.setItem("token", mockToken);
    });

    afterEach(() => {
        // Clear local storage after each test
        localStorage.removeItem("token");
    });

    test("Debe renderizar el componente", () => {
        render(<EditProfile />);
        expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
    });
});
