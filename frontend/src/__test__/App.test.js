import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom/extend-expect'; 
import EditProfile from "../EditProfile";

jest.mock("axios");

describe("EditProfile Component", () => {
    beforeEach(() => {
        // Optionally set up local storage for userEmail if needed
        localStorage.setItem("userEmail", "test@example.com");
    });

    afterEach(() => {
        // Clear local storage after each test
        localStorage.removeItem("userEmail");
    });

    test("should render the component", () => {
        render(<EditProfile />);
        expect(screen.getByText("Editar Perfil")).toBeInTheDocument();
    });
});
