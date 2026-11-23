import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { ThemeProvider } from '../context/ThemeContext';
import Login from '../pages/Login';
import Register from '../pages/Register';

function renderWithProviders(ui) {
  return render(
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>{ui}</BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

describe('Client Authentication Pages', () => {
  it('renders login form with fields and demo account buttons', () => {
    renderWithProviders(<Login />);

    expect(screen.getByText(/Welcome Back/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@campus.edu/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
    expect(screen.getByText(/Demo User/i)).toBeInTheDocument();
    expect(screen.getByText(/System Admin/i)).toBeInTheDocument();
  });

  it('renders registration form with required inputs', () => {
    renderWithProviders(<Register />);

    expect(screen.getByText(/Create an Account/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Jane Doe/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/jane@campus.edu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });
});
