const {
    validatePageNumber,
    normalizePokemonIdentifier,
    extractSpriteUrl,
    formatPokemonResponse
} = require('../../../utils/helpers');

describe('Helper Functions', () => {
    describe('validatePageNumber', () => {
        it('should return valid page numbers', () => {
            expect(validatePageNumber(1)).toBe(1);
            expect(validatePageNumber('5')).toBe(5);
            expect(validatePageNumber(200)).toBe(200);
        });

        it('should return default for invalid pages', () => {
            expect(validatePageNumber(0)).toBe(1);
            expect(validatePageNumber(201)).toBe(1);
            expect(validatePageNumber('invalid')).toBe(1);
            expect(validatePageNumber(null)).toBe(1);
        });

        it('should respect custom defaults', () => {
            expect(validatePageNumber(0, 5)).toBe(5);
            expect(validatePageNumber(300, 1, 300)).toBe(300);
        });
    });

    describe('normalizePokemonIdentifier', () => {
        it('should handle string inputs', () => {
            expect(normalizePokemonIdentifier('Pikachu')).toBe('pikachu');
            expect(normalizePokemonIdentifier('  Charizard  ')).toBe('charizard');
        });

        it('should handle number inputs', () => {
            expect(normalizePokemonIdentifier(25)).toBe('25');
            expect(normalizePokemonIdentifier('001')).toBe('001');
        });
    });

    describe('extractSpriteUrl', () => {
        const mockSprites = {
            front_default: 'default.png',
            other: {
                'official-artwork': { front_default: 'artwork.png' },
                home: { front_default: 'home.png' }
            }
        };

        it('should return first available sprite', () => {
            expect(extractSpriteUrl(mockSprites)).toBe('default.png');
            expect(extractSpriteUrl({ other: mockSprites.other })).toBe('artwork.png');
            expect(extractSpriteUrl({ other: { home: mockSprites.other.home } })).toBe('home.png');
        });

        it('should return null when no sprites found', () => {
            expect(extractSpriteUrl({})).toBeNull();
            expect(extractSpriteUrl(null)).toBeNull();
        });
    });

    describe('formatPokemonResponse', () => {
        const mockPokemon = {
            name: 'pikachu',
            id: 25,
            types: [{ type: { name: 'electric' } }],
            moves: [
                { move: { name: 'thunderbolt' } },
                { move: { name: 'quick-attack' } }
            ],
            sprites: {
                front_default: 'pikachu.png',
                other: { 'official-artwork': { front_default: 'artwork.png' } }
            },
            height: 40,
            weight: 60
        };

        it('should format pokemon data correctly', () => {
            const result = formatPokemonResponse(mockPokemon);
            expect(result).toEqual({
                name: 'pikachu',
                id: 25,
                types: ['electric'],
                moves: ['thunderbolt', 'quick-attack'],
                sprite: 'pikachu.png',
                height: 4,
                weight: 6
            });
        });

        it('should handle missing fields gracefully', () => {
            const result = formatPokemonResponse({ ...mockPokemon, sprites: {} });
            expect(result.sprite).toBeNull();
        });
    });
});