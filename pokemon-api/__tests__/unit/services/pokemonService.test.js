jest.mock('../../../utils/helpers', () => {
    const actual = jest.requireActual('../../../utils/helpers');
    return {
        ...actual,
        normalizePokemonIdentifier: jest.fn(id => id),
        validatePageNumber: jest.fn(page => page)
    };
});

const { PokemonService } = require('../../../services/pokemonService');
const helpers = require('../../../utils/helpers');
const { POKEAPI_BASE_URL } = require('../../../config/constants');

describe('PokemonService.getPokemonDetails', () => {
    let service;
    let mockAxios;

    beforeEach(() => {
        mockAxios = { get: jest.fn() };
        service = new PokemonService(mockAxios);
        jest.spyOn(helpers, 'normalizePokemonIdentifier').mockImplementation(id => id);
        // Remove the mock for formatPokemonResponse to use the real implementation
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should call normalizePokemonIdentifier, axios.get, and formatPokemonResponse with correct arguments', async () => {
        const identifier = 'pikachu';
        // Provide all required fields for formatPokemonResponse
        const apiResponse = {
            data: {
                name: 'pikachu',
                id: 25,
                types: [{ type: { name: 'electric' } }],
                moves: [
                    { move: { name: 'thunder-shock' } },
                    { move: { name: 'quick-attack' } }
                ],
                sprites: { front_default: 'sprite-url' },
                height: 4,
                weight: 60
            }
        };
        mockAxios.get.mockResolvedValue(apiResponse);

        const result = await service.getPokemonDetails(identifier);

        expect(helpers.normalizePokemonIdentifier).toHaveBeenCalledWith(identifier);
        expect(mockAxios.get).toHaveBeenCalledWith(`${POKEAPI_BASE_URL}/pokemon/${identifier}`);
        // Optionally, check for formatted result
        expect(result).toEqual({
            name: 'pikachu',
            id: 25,
            types: ['electric'],
            moves: ['thunder-shock', 'quick-attack'],
            sprite: 'sprite-url',
            height: 0.4,
            weight: 6
        });
    });

    it('should throw if axios.get fails', async () => {
        mockAxios.get.mockRejectedValue(new Error('Network error'));
        await expect(service.getPokemonDetails('bulbasaur')).rejects.toThrow('Network error');
    });
});
describe('PokemonService.getPaginatedPokemon', () => {
    let service;
    let mockFetchAllPokemon;
    let mockHelpers;

    beforeEach(() => {
        service = new PokemonService();
        mockFetchAllPokemon = jest.spyOn(service, 'fetchAllPokemon');
        mockHelpers = jest.spyOn(require('../../../utils/helpers'), 'validatePageNumber');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should validate the page number and return paginated, sorted results', async () => {
        const page = 2;
        const validatedPage = 2;
        const allPokemon = [
            { name: 'bulbasaur' },
            { name: 'charmander' },
            { name: 'squirtle' },
            { name: 'pikachu' },
            { name: 'eevee' },
            { name: 'snorlax' },
            { name: 'mew' }
        ];
        mockHelpers.mockReturnValue(validatedPage);
        mockFetchAllPokemon.mockResolvedValue(allPokemon);

        const result = await service.getPaginatedPokemon(page);

        // Sorted order: bulbasaur, charmander, eevee, mew, pikachu, snorlax, squirtle
        // Page 2, limit 5: offset 5, results: snorlax, squirtle
        expect(mockHelpers).toHaveBeenCalledWith(page);
        expect(mockFetchAllPokemon).toHaveBeenCalled();
        expect(result).toEqual({
            validatedPage: 2,
            totalPages: 2,
            results: [
                { name: 'snorlax' },
                { name: 'squirtle' }
            ]
        });
    });

    it('should return the first page if page is not provided', async () => {
        const validatedPage = 1;
        const allPokemon = [
            { name: 'bulbasaur' },
            { name: 'charmander' },
            { name: 'squirtle' },
            { name: 'pikachu' },
            { name: 'eevee' },
            { name: 'snorlax' }
        ];
        mockHelpers.mockReturnValue(validatedPage);
        mockFetchAllPokemon.mockResolvedValue(allPokemon);

        const result = await service.getPaginatedPokemon(undefined);

        // Sorted: bulbasaur, charmander, eevee, pikachu, snorlax, squirtle
        // Page 1, limit 5: offset 0, results: bulbasaur, charmander, eevee, pikachu, snorlax
        expect(result).toEqual({
            validatedPage: 1,
            totalPages: 2,
            results: [
                { name: 'bulbasaur' },
                { name: 'charmander' },
                { name: 'eevee' },
                { name: 'pikachu' },
                { name: 'snorlax' }
            ]
        });
    });

    it('should return empty results if offset is out of range', async () => {
        const validatedPage = 5;
        const allPokemon = [
            { name: 'bulbasaur' },
            { name: 'charmander' },
            { name: 'squirtle' }
        ];
        mockHelpers.mockReturnValue(validatedPage);
        mockFetchAllPokemon.mockResolvedValue(allPokemon);

        const result = await service.getPaginatedPokemon(5);

        expect(result).toEqual({
            validatedPage: 5,
            totalPages: 1,
            results: []
        });
    });

    it('should propagate errors from fetchAllPokemon', async () => {
        mockHelpers.mockReturnValue(1);
        mockFetchAllPokemon.mockRejectedValue(new Error('fetch error'));

        await expect(service.getPaginatedPokemon(1)).rejects.toThrow('fetch error');
    });
});
describe('PokemonService.fetchAllPokemon', () => {
    let service;
    let mockAxios;

    beforeEach(() => {
        mockAxios = { get: jest.fn() };
        service = new PokemonService(mockAxios);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('should fetch all pokemon from the API and return results', async () => {
        const mockResults = [{ name: 'bulbasaur' }, { name: 'charmander' }];
        mockAxios.get.mockResolvedValue({ data: { results: mockResults } });

        const result = await service.fetchAllPokemon();

        expect(mockAxios.get).toHaveBeenCalledWith(`${POKEAPI_BASE_URL}/pokemon?limit=1000`);
        expect(result).toEqual(mockResults);
    });

    it('should throw if axios.get fails', async () => {
        mockAxios.get.mockRejectedValue(new Error('API error'));
        await expect(service.fetchAllPokemon()).rejects.toThrow('API error');
    });
});

describe('PokemonService constructor', () => {
    it('should use provided axios instance', () => {
        const fakeAxios = {};
        const service = new PokemonService(fakeAxios);
        expect(service.axios).toBe(fakeAxios);
    });

    it('should use default axios if not provided', () => {
        const service = new PokemonService();
        expect(service.axios).toBe(require('axios'));
    });

    it('should set baseUrl from constants', () => {
        const service = new PokemonService();
        expect(service.baseUrl).toBe(require('../../../config/constants').POKEAPI_BASE_URL);
    });
});