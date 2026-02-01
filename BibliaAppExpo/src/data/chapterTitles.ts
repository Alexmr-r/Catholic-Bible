

type ChapterTitle = {
  [bookId: string]: {
    [chapter: number]: string;
  };
};

export const CHAPTER_TITLES: ChapterTitle = {
  genesis: {
    1: 'The Creation',
    2: 'The Garden of Eden',
    3: 'The Fall',
    4: 'Cain and Abel',
    5: 'The Descendants of Adam',
    6: 'The Flood',
    7: 'The Great Flood',
    8: 'The End of the Flood',
    9: 'The Covenant with Noah',
    10: 'The Table of Nations',
    11: 'The Tower of Babel',
    12: 'The Call of Abram',
    // ... más capítulos según necesites
  },
  exodus: {
    1: 'The Israelites in Egypt',
    2: 'The Birth of Moses',
    3: 'The Burning Bush',
    4: 'Moses Returns to Egypt',
    5: 'Bricks Without Straw',
    6: 'God Promises Deliverance',
    // ... más capítulos
  },
  matthew: {
    1: 'The Genealogy of Jesus',
    2: 'The Magi from the East',
    3: 'John the Baptist',
    4: 'The Temptation of Jesus',
    5: 'The Sermon on the Mount',
    6: 'The Lord\'s Prayer',
    // ... más capítulos
  },
  mark: {
    1: 'John the Baptist',
    2: 'Jesus Heals a Paralytic',
    // ... más capítulos
  },
  luke: {
    1: 'The Birth of John Foretold',
    2: 'The Birth of Jesus',
    // ... más capítulos
  },
  john: {
    1: 'The Word Became Flesh',
    2: 'The Wedding at Cana',
    3: 'Nicodemus Visits Jesus',
    // ... más capítulos
  },
  // ... más libros según necesites
};

/**
 * Gets the title for a specific chapter
 */
export function getChapterTitle(bookId: string, chapter: number): string | undefined {
  return CHAPTER_TITLES[bookId]?.[chapter];
}

