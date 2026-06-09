/**
 * Tests unitarios para funciones de validación
 */
import { isValidEmail, isValidPassword } from '../src/utils/validation';

describe('Validation Utils', () => {
  describe('isValidEmail()', () => {
    it('acepta email válido estándar', () => {
      expect(isValidEmail('user@example.com')).toBe(true);
    });

    it('acepta email con subdominio', () => {
      expect(isValidEmail('user@mail.example.com')).toBe(true);
    });

    it('acepta email con puntos en el nombre', () => {
      expect(isValidEmail('user.name@example.com')).toBe(true);
    });

    it('acepta email con + en el nombre', () => {
      expect(isValidEmail('user+tag@example.com')).toBe(true);
    });

    it('rechaza email sin @', () => {
      expect(isValidEmail('userexample.com')).toBe(false);
    });

    it('rechaza email sin dominio', () => {
      expect(isValidEmail('user@')).toBe(false);
    });

    it('rechaza email sin nombre de usuario', () => {
      expect(isValidEmail('@example.com')).toBe(false);
    });

    it('rechaza email con espacios', () => {
      expect(isValidEmail('user @example.com')).toBe(false);
    });

    it('rechaza string vacío', () => {
      expect(isValidEmail('')).toBe(false);
    });

    it('rechaza email sin extensión de dominio', () => {
      expect(isValidEmail('user@example')).toBe(false);
    });
  });

  describe('isValidPassword()', () => {
    it('acepta contraseña de 8 caracteres', () => {
      expect(isValidPassword('12345678')).toBe(true);
    });

    it('acepta contraseña larga', () => {
      expect(isValidPassword('MiContraseñaSegura123!')).toBe(true);
    });

    it('rechaza contraseña de 7 caracteres', () => {
      expect(isValidPassword('1234567')).toBe(false);
    });

    it('rechaza contraseña vacía', () => {
      expect(isValidPassword('')).toBe(false);
    });

    it('rechaza contraseña de 1 carácter', () => {
      expect(isValidPassword('a')).toBe(false);
    });
  });
});
