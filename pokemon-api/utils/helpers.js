/**
 * Validates a page number for pagination
 * @param {number|string} page - The page number to validate
 * @param {number} defaultPage - Default page if invalid (default: 1)
 * @param {number} maxPage - Maximum allowed page (default: 200)
 * @returns {number} Validated page number
 */
const validatePageNumber = (page, defaultPage = 1, maxPage = 200) => {
    const parsedPage = Number(page);
    if (isNaN(parsedPage) || parsedPage < 1 || parsedPage > maxPage) {
        return defaultPage;
    }
    return parsedPage;
};

/**
 * Normalizes a Pokémon identifier (name or ID)
 * @param {string|number} identifier - The Pokémon identifier
 * @returns {string} Normalized identifier (lowercase string)
 */
const normalizePokemonIdentifier = (identifier) => {
    if (typeof identifier === 'number') {
        return identifier.toString();
    }
    return identifier.toLowerCase().trim();
};

/**
 * Extracts sprite URL from Pokémon data
 * @param {object} sprites - Pokémon sprites object
 * @returns {string|null} Sprite URL or null if not found
 */
const extractSpriteUrl = (sprites) => {
    return (
        sprites?.front_default ||
        sprites?.other?.['official-artwork']?.front_default ||
        sprites?.other?.home?.front_default ||
        null
    );
};

/**
 * Formats Pokémon data for response
 * @param {object} pokemonData - Raw Pokémon data from API
 * @returns {object} Formatted Pokémon data
 */
const formatPokemonResponse = (pokemonData) => ({
    name: pokemonData.name,
    id: pokemonData.id,
    types: pokemonData.types.map(t => t.type.name),
    moves: pokemonData.moves.slice(0, 5).map(m => m.move.name),
    sprite: extractSpriteUrl(pokemonData.sprites),
    height: pokemonData.height / 10, // in meters
    weight: pokemonData.weight / 10  // in kilograms
});

module.exports = {
    validatePageNumber,
    normalizePokemonIdentifier,
    extractSpriteUrl,
    formatPokemonResponse
};