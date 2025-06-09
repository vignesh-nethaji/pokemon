const pokemonService = require('../services/pokemonService');

const getPaginatedPokemon = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const pokemonData = await pokemonService.getPaginatedPokemon(page);
        res.json(pokemonData);
    } catch (error) {
        next(error);
    }
};

const getPokemonDetails = async (req, res, next) => {
    try {
        const identifier = req.params.identifier;
        const pokemonDetails = await pokemonService.getPokemonDetails(identifier);
        res.json(pokemonDetails);
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getPaginatedPokemon,
    getPokemonDetails
};