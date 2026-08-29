const fs = require('fs');
const path = require('path');

const genresList = [
  { id: 28, name: 'Ação' },
  { id: 12, name: 'Aventura' },
  { id: 16, name: 'Animação' },
  { id: 35, name: 'Comédia' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentário' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Família' },
  { id: 14, name: 'Fantasia' },
  { id: 36, name: 'História' },
  { id: 27, name: 'Terror' },
  { id: 10402, name: 'Música' },
  { id: 9648, name: 'Mistério' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Ficção Científica' },
  { id: 10770, name: 'Cinema TV' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'Guerra' },
  { id: 37, name: 'Faroeste' }
];

const posters = [
  '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  '/oYuLEIVWz2OiuhyCY7cW2q33xev.jpg',
  '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
  '/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg',
  '/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg',
  '/3bhkrj58Vtu7enYsRolD1fZdja1.jpg',
  '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
  '/8b8R8W88vje9dn9OE8PY05Nxl1X.jpg',
  '/vpnVM9B6NMmQpEZaEkVVvMhKOVP.jpg',
  '/62HCio2Dipuvh1uMmgPjG2W88p7.jpg',
  '/fiW4LMgR9vPxMu9u21W3aY94z7N.jpg',
  '/qA11uB4o68W4jH7X3x58U0e7A30.jpg'
];

const backdrops = [
  '/xJHokMbljvjADYdit5fKSuV0Te.jpg',
  '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
  '/nMK2819TyqLnTFiCBD9oYGi2qOp.jpg',
  '/hZkgoQY85KGWFToRHub4ee1wY3C.jpg',
  '/suaEOtk1N1sgg2MTM7oZd2cfNIk.jpg',
  '/rSPw7tgCH9c6NqICZefy2aUMqC.jpg',
  '/fm6KqXpk3M2HVveHwCrBSSBaO0V.jpg',
  '/xOMo8BRK7PfcJv9JCnx7s52B3xs.jpg'
];

// Curated list of classic & famous movie titles
const famousMovies = [
  { id: 157336, title: 'Interestelar', original_title: 'Interstellar', release: '2014-11-05', runtime: 169, rating: 8.4, votes: 34500, genres: [878, 18, 12] },
  { id: 27205, title: 'A Origem', original_title: 'Inception', release: '2010-07-15', runtime: 148, rating: 8.4, votes: 35000, genres: [878, 28, 12] },
  { id: 155, title: 'Batman: O Cavaleiro das Trevas', original_title: 'The Dark Knight', release: '2008-07-16', runtime: 152, rating: 8.5, votes: 32000, genres: [18, 28, 80] },
  { id: 550, title: 'Clube da Luta', original_title: 'Fight Club', release: '1999-10-15', runtime: 139, rating: 8.4, votes: 28000, genres: [18, 53] },
  { id: 680, title: 'Pulp Fiction: Tempo de Violência', original_title: 'Pulp Fiction', release: '1994-09-10', runtime: 154, rating: 8.5, votes: 27000, genres: [53, 80] },
  { id: 238, title: 'O Padrinho', original_title: 'The Godfather', release: '1972-03-14', runtime: 175, rating: 8.7, votes: 19000, genres: [18, 80] },
  { id: 872585, title: 'Oppenheimer', original_title: 'Oppenheimer', release: '2023-07-19', runtime: 180, rating: 8.1, votes: 8900, genres: [18, 36] },
  { id: 438631, title: 'Duna: Parte Dois', original_title: 'Dune: Part Two', release: '2024-02-27', runtime: 166, rating: 8.2, votes: 5400, genres: [878, 12] },
  { id: 13, title: 'Forrest Gump: O Contador de Histórias', original_title: 'Forrest Gump', release: '1994-06-23', runtime: 142, rating: 8.5, votes: 26500, genres: [35, 18, 10749] },
  { id: 278, title: 'Um Sonho de Liberdade', original_title: 'The Shawshank Redemption', release: '1994-09-23', runtime: 142, rating: 8.7, votes: 27100, genres: [18, 80] },
  { id: 603, title: 'Matrix', original_title: 'The Matrix', release: '1999-03-30', runtime: 136, rating: 8.2, votes: 24900, genres: [28, 878] },
  { id: 120, title: 'O Senhor dos Anéis: A Sociedade do Anel', original_title: 'The Lord of the Rings: The Fellowship of the Ring', release: '2001-12-18', runtime: 178, rating: 8.4, votes: 24200, genres: [12, 14, 28] },
  { id: 121, title: 'O Senhor dos Anéis: As Duas Torres', original_title: 'The Lord of the Rings: The Two Towers', release: '2002-12-18', runtime: 179, rating: 8.4, votes: 21500, genres: [12, 14, 28] },
  { id: 122, title: 'O Senhor dos Anéis: O Retorno do Rei', original_title: 'The Lord of the Rings: The Return of the King', release: '2003-12-01', runtime: 201, rating: 8.5, votes: 23400, genres: [12, 14, 28] },
  { id: 24428, title: 'Os Vingadores', original_title: 'The Avengers', release: '2012-04-25', runtime: 143, rating: 7.7, votes: 29800, genres: [28, 12, 878] },
  { id: 299536, title: 'Vingadores: Guerra Infinita', original_title: 'Avengers: Infinity War', release: '2018-04-25', runtime: 149, rating: 8.3, votes: 28900, genres: [28, 12, 878] },
  { id: 299534, title: 'Vingadores: Ultimato', original_title: 'Avengers: Endgame', release: '2019-04-24', runtime: 181, rating: 8.3, votes: 24800, genres: [28, 12, 878] },
  { id: 19995, title: 'Avatar', original_title: 'Avatar', release: '2009-12-15', runtime: 162, rating: 7.6, votes: 31200, genres: [28, 12, 14, 878] },
  { id: 76600, title: 'Avatar: O Caminho da Água', original_title: 'Avatar: The Way of Water', release: '2022-12-14', runtime: 192, rating: 7.6, votes: 11500, genres: [878, 12, 28] },
  { id: 597, title: 'Titanic', original_title: 'Titanic', release: '1997-11-18', runtime: 194, rating: 7.9, votes: 24300, genres: [18, 10749] }
];

const adjectives = ['Sombrio', 'Imortal', 'Supremo', 'Eterno', 'Perdido', 'Renascido', 'Invisível', 'Secreto', 'Último', 'Lendário', 'Silencioso', 'Fantasmal', 'Celeste', 'Sideral', 'Misterioso', 'Proibido', 'Glorioso', 'Cruel', 'Selvagem', 'Brilhante'];
const nouns = ['Império', 'Destino', 'Guerreiro', 'Horizonte', 'Segredo', 'Legado', 'Labirinto', 'Portal', 'Espelho', 'Dragão', 'Reino', 'Caçador', 'Pesadelo', 'Abismo', 'Código', 'Fantasma', 'Protocolo', 'Alquimista', 'Sentinela', 'Viajante'];
const subtitles = ['A Origem da Lenda', 'O Confronto Final', 'A Vingança', 'O Despertar', 'Em Busca da Verdade', 'A Era da Escuridão', 'Sem Regresso', 'A Marca da Justiça', 'O Último Capítulo', 'A Aliança Proibida'];

function generateMovies() {
  const moviesList = [];
  const usedIds = new Set();

  // Add famous curated movies first
  for (const m of famousMovies) {
    usedIds.add(m.id);
    const movieGenres = m.genres.map(gid => genresList.find(g => g.id === gid) || { id: gid, name: 'Gênero' });
    moviesList.push({
      _id: m.id,
      title: m.title,
      original_title: m.original_title,
      poster_path: posters[moviesList.length % posters.length],
      backdrop_path: backdrops[moviesList.length % backdrops.length],
      overview: `${m.title} é uma aclamada produção cinematográfica com alta avaliação do público e da crítica mundial.`,
      release_date: m.release,
      runtime: m.runtime,
      vote_average: m.rating,
      vote_count: m.votes,
      genres: movieGenres
    });
  }

  let nextId = 1001;
  while (moviesList.length < 1000) {
    while (usedIds.has(nextId)) {
      nextId++;
    }
    usedIds.add(nextId);

    const adj = adjectives[moviesList.length % adjectives.length];
    const noun = nouns[(moviesList.length * 3) % nouns.length];
    const sub = subtitles[(moviesList.length * 7) % subtitles.length];

    const title = `${noun} ${adj}: ${sub}`;
    const origTitle = `The ${adj} ${noun}: ${sub}`;
    
    // Pick 2-3 random genres
    const gCount = (moviesList.length % 2) + 2;
    const mGenres = [];
    for (let i = 0; i < gCount; i++) {
      const gObj = genresList[(moviesList.length * 5 + i * 3) % genresList.length];
      if (!mGenres.some(g => g.id === gObj.id)) {
        mGenres.push(gObj);
      }
    }

    const year = 1970 + (moviesList.length % 56);
    const month = String((moviesList.length % 12) + 1).padStart(2, '0');
    const day = String((moviesList.length % 28) + 1).padStart(2, '0');
    const releaseDate = `${year}-${month}-${day}`;
    const runtime = 90 + (moviesList.length % 95);
    const voteAvg = Number((6.0 + (moviesList.length % 35) / 10).toFixed(1));
    const voteCount = 500 + (moviesList.length * 37) % 25000;

    moviesList.push({
      _id: nextId,
      title: title,
      original_title: origTitle,
      poster_path: posters[moviesList.length % posters.length],
      backdrop_path: backdrops[moviesList.length % backdrops.length],
      overview: `${title} conta uma história envolvente e emocionante de suspense e reviravoltas.`,
      release_date: releaseDate,
      runtime: runtime,
      vote_average: voteAvg,
      vote_count: voteCount,
      genres: mGenres
    });

    nextId++;
  }

  const outputPath = path.join(__dirname, '../data/movies_dataset_1000.json');
  fs.writeFileSync(outputPath, JSON.stringify(moviesList, null, 2), 'utf-8');
  console.log(`✅ Gerado com sucesso dataset com ${moviesList.length} filmes em: ${outputPath}`);
}

generateMovies();
