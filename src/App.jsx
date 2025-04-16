import React, { useState, useEffect, useCallback } from 'react';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [filteredPokemon, setFilteredPokemon] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPokemon = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
      if (!response.ok) throw new Error('Failed to fetch Pokémon data');
      const data = await response.json();
      setPokemonList(data.results);
      setFilteredPokemon(data.results);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPokemon();
  }, [fetchPokemon]);

  useEffect(() => {
    if (searchTerm === '') {
      setFilteredPokemon(pokemonList);
    } else {
      const filtered = pokemonList.filter(pokemon =>
        pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPokemon(filtered);
    }
  }, [searchTerm, pokemonList]);

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="border-4 border-t-blue-600 border-gray-200 rounded-full w-12 h-12 animate-spin mb-4"></div>
        <p className="text-gray-600">Loading Pokémon...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-600 mb-4">Error: {error}</p>
        <button
          onClick={fetchPokemon}
          className="bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col max-w-screen-xl mx-auto px-4 py-6">
      <header className="text-center mb-8 p-4 bg-blue-800 text-white rounded shadow-md">
        <h1 className="text-3xl font-bold text-yellow-400 mb-3">Pokédex</h1>
        <div className="relative max-w-md mx-auto">
          <input
            type="text"
            placeholder="Search Pokémon..."
            value={searchTerm}
            onChange={handleSearchChange}
            aria-label="Search Pokémon"
            className="w-full pl-10 pr-4 py-2 text-blue-800 bg-white rounded-full text-sm shadow focus:outline-none focus:ring focus:ring-blue-300"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
      </header>

      <main className="flex-1">
        {filteredPokemon.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredPokemon.map((pokemon) => (
              <PokemonCard key={pokemon.name} pokemon={pokemon} />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-10">
            <p>No Pokémon found matching "{searchTerm}"</p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-4 bg-blue-700 text-white px-4 py-2 rounded hover:bg-blue-800"
            >
              Clear Search
            </button>
          </div>
        )}
      </main>

      <footer className="text-center mt-10 text-xs text-gray-400">
        Pokémon and Pokémon character names are trademarks of Nintendo.
      </footer>
    </div>
  );
}

const PokemonCard = React.memo(({ pokemon }) => {
  const [pokemonDetails, setPokemonDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    const fetchPokemonDetails = async () => {
      try {
        const response = await fetch(pokemon.url, { signal });
        const data = await response.json();
        setPokemonDetails(data);
        setLoading(false);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching Pokémon details:', err);
          setLoading(false);
        }
      }
    };

    fetchPokemonDetails();
    return () => controller.abort();
  }, [pokemon.url]);

  const handleImageError = () => setImageError(true);

  if (loading || !pokemonDetails) {
    return (
      <div className="flex flex-col items-center justify-center p-4 bg-white rounded shadow h-48 animate-pulse">
        <div className="w-20 h-20 bg-gray-300 rounded-full mb-4"></div>
        <div className="w-3/4 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  const id = pokemonDetails.id.toString().padStart(3, '0');
  const imageUrl = imageError
    ? 'https://via.placeholder.com/150?text=No+Image'
    : pokemonDetails.sprites.other['official-artwork'].front_default ||
      pokemonDetails.sprites.front_default;

  const getTypeColorClass = (type) => {
    const typeColors = {
      normal: 'bg-gray-400',
      fire: 'bg-orange-500',
      water: 'bg-blue-400',
      electric: 'bg-yellow-400',
      grass: 'bg-green-500',
      ice: 'bg-blue-200',
      fighting: 'bg-red-600',
      poison: 'bg-purple-500',
      ground: 'bg-yellow-600',
      flying: 'bg-indigo-300',
      psychic: 'bg-pink-400',
      bug: 'bg-lime-600',
      rock: 'bg-yellow-800',
      ghost: 'bg-purple-700',
      dragon: 'bg-indigo-700',
      dark: 'bg-gray-700',
      steel: 'bg-gray-500',
      fairy: 'bg-pink-300',
    };
    return typeColors[type] || 'bg-gray-300';
  };

  return (
    <div
      className="bg-white p-4 rounded-lg shadow hover:shadow-lg transform hover:-translate-y-1 transition duration-300 text-center cursor-pointer"
      tabIndex="0"
    >
      <div className="text-sm text-gray-400 text-left">#{id}</div>
      <img
        src={imageUrl}
        alt={pokemon.name}
        className="w-24 h-24 mx-auto my-2 object-contain"
        loading="lazy"
        onError={handleImageError}
      />
      <h3 className="capitalize text-lg font-semibold text-gray-800 mb-2">
        {pokemon.name}
      </h3>
      <div className="flex justify-center gap-2 flex-wrap mb-2">
        {pokemonDetails.types.map((type) => (
          <span
            key={type.type.name}
            className={`px-2 py-1 text-xs rounded-full text-white capitalize ${getTypeColorClass(type.type.name)}`}
          >
            {type.type.name}
          </span>
        ))}
      </div>
      <div className="text-xs text-gray-500 space-y-1">
        <div>Height: {(pokemonDetails.height / 10).toFixed(1)}m</div>
        <div>Weight: {(pokemonDetails.weight / 10).toFixed(1)}kg</div>
      </div>
    </div>
  );
});

export default App;