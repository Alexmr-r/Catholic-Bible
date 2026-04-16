-- =====================================================
-- V6: Translate books to English
-- =====================================================

UPDATE books SET name = 'Genesis', abbreviation = 'Gen', category = 'Pentateuch', description = 'Creation of the world, primitive history of humanity, and the patriarchs of Israel.', author = 'Moses' WHERE id = 'genesis';
UPDATE books SET name = 'Exodus', abbreviation = 'Ex', category = 'Pentateuch', description = 'The liberation of the people of Israel from slavery in Egypt and the covenant at Sinai.', author = 'Moses' WHERE id = 'exodus';
UPDATE books SET name = 'Leviticus', abbreviation = 'Lv', category = 'Pentateuch', description = 'Ritual and moral laws for the people of Israel.', author = 'Moses' WHERE id = 'leviticus';
UPDATE books SET name = 'Numbers', abbreviation = 'Nm', category = 'Pentateuch', description = 'The journey of the people of Israel through the desert.', author = 'Moses' WHERE id = 'numbers';
UPDATE books SET name = 'Deuteronomy', abbreviation = 'Dt', category = 'Pentateuch', description = 'Second law: Moses speeches before entering the promised land.', author = 'Moses' WHERE id = 'deuteronomy';

UPDATE books SET name = 'Joshua', abbreviation = 'Jos', category = 'Historical' WHERE id = 'joshua';
UPDATE books SET name = 'Judges', abbreviation = 'Jdg', category = 'Historical' WHERE id = 'judges';
UPDATE books SET name = 'Ruth', abbreviation = 'Ru', category = 'Historical' WHERE id = 'ruth';
UPDATE books SET name = '1 Samuel', abbreviation = '1Sm', category = 'Historical' WHERE id = '1samuel';
UPDATE books SET name = '2 Samuel', abbreviation = '2Sm', category = 'Historical' WHERE id = '2samuel';
UPDATE books SET name = '1 Kings', abbreviation = '1Kgs', category = 'Historical' WHERE id = '1kings';
UPDATE books SET name = '2 Kings', abbreviation = '2Kgs', category = 'Historical' WHERE id = '2kings';
UPDATE books SET name = '1 Chronicles', abbreviation = '1Chr', category = 'Historical' WHERE id = '1chronicles';
UPDATE books SET name = '2 Chronicles', abbreviation = '2Chr', category = 'Historical' WHERE id = '2chronicles';
UPDATE books SET name = 'Ezra', abbreviation = 'Ezr', category = 'Historical' WHERE id = 'ezra';
UPDATE books SET name = 'Nehemiah', abbreviation = 'Neh', category = 'Historical' WHERE id = 'nehemiah';
UPDATE books SET name = 'Tobit', abbreviation = 'Tb', category = 'Historical' WHERE id = 'tobit';
UPDATE books SET name = 'Judith', abbreviation = 'Jdt', category = 'Historical' WHERE id = 'judith';
UPDATE books SET name = 'Esther', abbreviation = 'Est', category = 'Historical' WHERE id = 'esther';
UPDATE books SET name = '1 Maccabees', abbreviation = '1Mc', category = 'Historical' WHERE id = '1maccabees';
UPDATE books SET name = '2 Maccabees', abbreviation = '2Mc', category = 'Historical' WHERE id = '2maccabees';

UPDATE books SET name = 'Job', abbreviation = 'Jb', category = 'Wisdom' WHERE id = 'job';
UPDATE books SET name = 'Psalms', abbreviation = 'Ps', category = 'Wisdom' WHERE id = 'psalms';
UPDATE books SET name = 'Proverbs', abbreviation = 'Prv', category = 'Wisdom' WHERE id = 'proverbs';
UPDATE books SET name = 'Ecclesiastes', abbreviation = 'Eccl', category = 'Wisdom' WHERE id = 'ecclesiastes';
UPDATE books SET name = 'Song of Solomon', abbreviation = 'Sg', category = 'Wisdom' WHERE id = 'song';
UPDATE books SET name = 'Wisdom', abbreviation = 'Wis', category = 'Wisdom' WHERE id = 'wisdom';
UPDATE books SET name = 'Sirach', abbreviation = 'Sir', category = 'Wisdom' WHERE id = 'sirach';

UPDATE books SET name = 'Isaiah', abbreviation = 'Is', category = 'Major Prophets' WHERE id = 'isaiah';
UPDATE books SET name = 'Jeremiah', abbreviation = 'Jer', category = 'Major Prophets' WHERE id = 'jeremiah';
UPDATE books SET name = 'Lamentations', abbreviation = 'Lam', category = 'Major Prophets' WHERE id = 'lamentations';
UPDATE books SET name = 'Baruch', abbreviation = 'Bar', category = 'Major Prophets' WHERE id = 'baruch';
UPDATE books SET name = 'Ezekiel', abbreviation = 'Ez', category = 'Major Prophets' WHERE id = 'ezekiel';
UPDATE books SET name = 'Daniel', abbreviation = 'Dn', category = 'Major Prophets' WHERE id = 'daniel';

UPDATE books SET name = 'Hosea', abbreviation = 'Hos', category = 'Minor Prophets' WHERE id = 'hosea';
UPDATE books SET name = 'Joel', abbreviation = 'Jl', category = 'Minor Prophets' WHERE id = 'joel';
UPDATE books SET name = 'Amos', abbreviation = 'Am', category = 'Minor Prophets' WHERE id = 'amos';
UPDATE books SET name = 'Obadiah', abbreviation = 'Ob', category = 'Minor Prophets' WHERE id = 'obadiah';
UPDATE books SET name = 'Jonah', abbreviation = 'Jon', category = 'Minor Prophets' WHERE id = 'jonah';
UPDATE books SET name = 'Micah', abbreviation = 'Mi', category = 'Minor Prophets' WHERE id = 'micah';
UPDATE books SET name = 'Nahum', abbreviation = 'Na', category = 'Minor Prophets' WHERE id = 'nahum';
UPDATE books SET name = 'Habakkuk', abbreviation = 'Hb', category = 'Minor Prophets' WHERE id = 'habakkuk';
UPDATE books SET name = 'Zephaniah', abbreviation = 'Zep', category = 'Minor Prophets' WHERE id = 'zephaniah';
UPDATE books SET name = 'Haggai', abbreviation = 'Hg', category = 'Minor Prophets' WHERE id = 'haggai';
UPDATE books SET name = 'Zechariah', abbreviation = 'Zec', category = 'Minor Prophets' WHERE id = 'zechariah';
UPDATE books SET name = 'Malachi', abbreviation = 'Mal', category = 'Minor Prophets' WHERE id = 'malachi';

UPDATE books SET name = 'Matthew', abbreviation = 'Mt', category = 'Gospels', author = 'Matthew' WHERE id = 'matthew';
UPDATE books SET name = 'Mark', abbreviation = 'Mk', category = 'Gospels', author = 'Mark' WHERE id = 'mark';
UPDATE books SET name = 'Luke', abbreviation = 'Lk', category = 'Gospels', author = 'Luke' WHERE id = 'luke';
UPDATE books SET name = 'John', abbreviation = 'Jn', category = 'Gospels', author = 'John' WHERE id = 'john';

UPDATE books SET name = 'Acts', abbreviation = 'Acts', category = 'History', author = 'Luke' WHERE id = 'acts';

UPDATE books SET name = 'Romans', abbreviation = 'Rom', category = 'Pauline Letters', author = 'Paul' WHERE id = 'romans';
UPDATE books SET name = '1 Corinthians', abbreviation = '1Cor', category = 'Pauline Letters', author = 'Paul' WHERE id = '1corinthians';
UPDATE books SET name = '2 Corinthians', abbreviation = '2Cor', category = 'Pauline Letters', author = 'Paul' WHERE id = '2corinthians';
UPDATE books SET name = 'Galatians', abbreviation = 'Gal', category = 'Pauline Letters', author = 'Paul' WHERE id = 'galatians';
UPDATE books SET name = 'Ephesians', abbreviation = 'Eph', category = 'Pauline Letters', author = 'Paul' WHERE id = 'ephesians';
UPDATE books SET name = 'Philippians', abbreviation = 'Phil', category = 'Pauline Letters', author = 'Paul' WHERE id = 'philippians';
UPDATE books SET name = 'Colossians', abbreviation = 'Col', category = 'Pauline Letters', author = 'Paul' WHERE id = 'colossians';
UPDATE books SET name = '1 Thessalonians', abbreviation = '1Thes', category = 'Pauline Letters', author = 'Paul' WHERE id = '1thessalonians';
UPDATE books SET name = '2 Thessalonians', abbreviation = '2Thes', category = 'Pauline Letters', author = 'Paul' WHERE id = '2thessalonians';
UPDATE books SET name = '1 Timothy', abbreviation = '1Tim', category = 'Pauline Letters', author = 'Paul' WHERE id = '1timothy';
UPDATE books SET name = '2 Timothy', abbreviation = '2Tim', category = 'Pauline Letters', author = 'Paul' WHERE id = '2timothy';
UPDATE books SET name = 'Titus', abbreviation = 'Ti', category = 'Pauline Letters', author = 'Paul' WHERE id = 'titus';
UPDATE books SET name = 'Philemon', abbreviation = 'Phlm', category = 'Pauline Letters', author = 'Paul' WHERE id = 'philemon';

UPDATE books SET name = 'Hebrews', abbreviation = 'Heb', category = 'Catholic Letters' WHERE id = 'hebrews';

UPDATE books SET name = 'James', abbreviation = 'Jas', category = 'Catholic Letters', author = 'James' WHERE id = 'james';
UPDATE books SET name = '1 Peter', abbreviation = '1Pt', category = 'Catholic Letters', author = 'Peter' WHERE id = '1peter';
UPDATE books SET name = '2 Peter', abbreviation = '2Pt', category = 'Catholic Letters', author = 'Peter' WHERE id = '2peter';
UPDATE books SET name = '1 John', abbreviation = '1Jn', category = 'Catholic Letters', author = 'John' WHERE id = '1john';
UPDATE books SET name = '2 John', abbreviation = '2Jn', category = 'Catholic Letters', author = 'John' WHERE id = '2john';
UPDATE books SET name = '3 John', abbreviation = '3Jn', category = 'Catholic Letters', author = 'John' WHERE id = '3john';
UPDATE books SET name = 'Jude', abbreviation = 'Jude', category = 'Catholic Letters', author = 'Jude' WHERE id = 'jude';

UPDATE books SET name = 'Revelation', abbreviation = 'Rev', category = 'Prophetic', author = 'John' WHERE id = 'revelation';
