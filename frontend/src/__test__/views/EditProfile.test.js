import React from 'react';
import { act } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import EditProfile from '../../views/EditProfile';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

jest.mock('axios');
jest.mock('jwt-decode');

describe('EditProfile', () => {
    const mockToken = 'fake-token';
    const mockEmail = 'test@example.com';
    const mockUserData = {
        name: 'John',
        last_name: 'Doe',
        email: mockEmail,
        phone: '123456789',
    };

    beforeEach(() => {
        localStorage.setItem('token', mockToken);
        jwtDecode.mockReturnValue({ email: mockEmail });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('Carga y muestra los datos del usuario', async () => {
        axios.get.mockResolvedValue({ data: mockUserData });

        await act(async () => {
            render(<EditProfile />);
        });

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre/i).value).toBe(mockUserData.name);
            expect(screen.getByLabelText(/Apellidos/i).value).toBe(mockUserData.last_name);
            expect(screen.getByLabelText(/Correo/i).value).toBe(mockUserData.email);
        });
    });

    it('Muestra un error cuando no se pueden cargar los datos del usuario', async () => {
        axios.get.mockRejectedValue(new Error('Error al obtener los datos del usuario'));

        await act(async () => {
            render(<EditProfile />);
        });

        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar los datos del usuario/i)).toBeInTheDocument();
        });
    });

    it('Muestra el modal cuando el formulario se envía correctamente', async () => {
        axios.post.mockResolvedValue({ status: 200 });

        await act(async () => {
            render(<EditProfile />);
        });

        fireEvent.click(screen.getByText(/Guardar Cambios/i));

        await waitFor(() => {
            expect(screen.getByText(/ÉXITO/)).toBeInTheDocument();
        });
    });
});
