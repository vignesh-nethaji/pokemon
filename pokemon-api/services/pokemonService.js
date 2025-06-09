const axios = require('axios');
const { POKEAPI_BASE_URL } = require('../config/constants');
const {
    validatePageNumber,
    normalizePokemonIdentifier,
    formatPokemonResponse
} = require('../utils/helpers');

class PokemonService {
    constructor(axiosInstance) {
        this.axios = axiosInstance || axios;
        this.baseUrl = POKEAPI_BASE_URL;
    }

    async fetchAllPokemon() {
        const response = await this.axios.get(`${this.baseUrl}/pokemon?limit=1000`);
        return response.data.results;
    }

    async getPaginatedPokemon(page) {
        const validatedPage = validatePageNumber(page);
        const limit = 5;
        const offset = (validatedPage - 1) * limit;

        const allPokemon = await this.fetchAllPokemon();
        const sortedPokemon = allPokemon.sort((a, b) => a.name.localeCompare(b.name));
        const paginatedPokemon = sortedPokemon.slice(offset, offset + limit);

        return {
            validatedPage,
            totalPages: Math.ceil(allPokemon.length / limit),
            results: paginatedPokemon
        };
    }

    async getPokemonDetails(identifier) {
        const normalizedId = normalizePokemonIdentifier(identifier);
        const response = await this.axios.get(`${this.baseUrl}/pokemon/${normalizedId}`);
        return formatPokemonResponse(response.data);
    }
}

module.exports = new PokemonService();
module.exports.PokemonService = PokemonService; // For testing