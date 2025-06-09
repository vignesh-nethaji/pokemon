const pokemonController = require('../../../controllers/pokemonController');
const pokemonService = require('../../../services/pokemonService');

jest.mock('../../../services/pokemonService');

describe('PokemonController', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        mockReq = {
            params: {},
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        mockNext = jest.fn();
    });

    describe('getPaginatedPokemon', () => {
        it('should return paginated pokemon', async () => {
            mockReq.query.page = '1';
            const mockData = {
                page: 1,
                totalPages: 2,
                results: [{ name: 'bulbasaur' }]
            };

            pokemonService.getPaginatedPokemon.mockResolvedValue(mockData);

            await pokemonController.getPaginatedPokemon(mockReq, mockRes, mockNext);

            expect(pokemonService.getPaginatedPokemon).toHaveBeenCalledWith(1);
            expect(mockRes.json).toHaveBeenCalledWith(mockData);
        });

        it('should handle errors', async () => {
            const mockError = new Error('API error');
            pokemonService.getPaginatedPokemon.mockRejectedValue(mockError);

            await pokemonController.getPaginatedPokemon(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });

    describe('getPokemonDetails', () => {
        it('should return pokemon details', async () => {
            mockReq.params.identifier = 'pikachu';
            const mockDetails = {
                name: 'pikachu',
                types: ['electric'],
                moves: ['thunderbolt'],
                sprite: 'pikachu.png'
            };

            pokemonService.getPokemonDetails.mockResolvedValue(mockDetails);

            await pokemonController.getPokemonDetails(mockReq, mockRes, mockNext);

            expect(pokemonService.getPokemonDetails).toHaveBeenCalledWith('pikachu');
            expect(mockRes.json).toHaveBeenCalledWith(mockDetails);
        });

        it('should handle errors', async () => {
            mockReq.params.identifier = 'charizard';
            const mockError = new Error('Not found');
            pokemonService.getPokemonDetails.mockRejectedValue(mockError);

            await pokemonController.getPokemonDetails(mockReq, mockRes, mockNext);

            expect(mockNext).toHaveBeenCalledWith(mockError);
        });
    });
});