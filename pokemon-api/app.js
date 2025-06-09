const express = require('express');
const corsMiddleware = require('./config/corsConfig');
const pokemonController = require('./controllers/pokemonController');
const errorHandler = require('./middleware/errorHandler');

class App {
    constructor() {
        this.app = express();
        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        this.app.use(corsMiddleware);
        this.app.use(express.json());
    }

    initializeRoutes() {
        this.app.get('/pokemon', pokemonController.getPaginatedPokemon);
        this.app.get('/pokemon/:identifier', pokemonController.getPokemonDetails);
        // Test-only error route for integration testing
        if (process.env.NODE_ENV === 'test') {
            this.app.get('/error', (req, res, next) => next(new Error('fail')));
        }
    }

    initializeErrorHandling() {
        this.app.use(errorHandler);
    }

    listen() {
        const PORT = process.env.PORT || 3000;
        this.app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    }
}

module.exports = App;