const request = require('supertest');
const express = require('express');
const App = require('../../app');

// Mock dependencies
jest.mock('../../controllers/pokemonController', () => ({
    getPaginatedPokemon: jest.fn((req, res) => res.json({ called: 'getPaginatedPokemon' })),
    getPokemonDetails: jest.fn((req, res) => res.json({ called: 'getPokemonDetails', id: req.params.identifier }))
}));
jest.mock('../../config/corsConfig', () => (req, res, next) => next());

describe('App Integration', () => {
    let app;

    beforeEach(() => {
        app = new App().app;
    });

    it('should respond to GET /pokemon', async () => {
        const res = await request(app).get('/pokemon');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ called: 'getPaginatedPokemon' });
    });

    it('should respond to GET /pokemon/:identifier', async () => {
        const res = await request(app).get('/pokemon/pikachu');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ called: 'getPokemonDetails', id: 'pikachu' });
    });

    it('should use error handler for errors', async () => {
        // Override route to throw
        app.get('/error', (req, res, next) => next(new Error('fail')));
        const res = await request(app).get('/error');
        expect(res.status).toBe(500);
        expect(res.body).toHaveProperty('error');
    });
});