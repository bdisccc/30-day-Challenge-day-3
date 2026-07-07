const WORD_DATABASE = {
  Fantasy: FANTASY_WORDS,
  Animals: ANIMAL_WORDS,
  Food: FOOD_WORDS,
  Place: PLACE_WORDS,
  Games: GAME_WORDS,
  Movies: MOVIE_WORDS,
  Pokemon: POKEMON_WORDS,
  Disney: DISNEY_WORDS,
  Marvel: MARVEL_WORDS,
  Science: SCIENCE_WORDS,
  Sports: SPORTS_WORDS,
  Technology: TECHNOLOGY_WORDS,
  General: GENERAL_WORDS
};

const words = Object.values(WORD_DATABASE).flat();
