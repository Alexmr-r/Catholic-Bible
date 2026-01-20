-- =====================================================
-- V2: Datos iniciales - Catálogo de libros de la Biblia Católica
-- =====================================================

-- =====================================================
-- ANTIGUO TESTAMENTO (46 libros)
-- =====================================================

-- Pentateuco (5 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description, author) VALUES
('genesis', 'Génesis', 'Gn', 'old', 'Pentateuco', 50, 1, 'Narración de la creación del mundo, la historia primitiva de la humanidad y los patriarcas de Israel.', 'Moisés'),
('exodus', 'Éxodo', 'Ex', 'old', 'Pentateuco', 40, 2, 'La liberación del pueblo de Israel de la esclavitud en Egipto y el pacto del Sinaí.', 'Moisés'),
('leviticus', 'Levítico', 'Lv', 'old', 'Pentateuco', 27, 3, 'Leyes rituales y morales para el pueblo de Israel.', 'Moisés'),
('numbers', 'Números', 'Nm', 'old', 'Pentateuco', 36, 4, 'El viaje del pueblo de Israel por el desierto.', 'Moisés'),
('deuteronomy', 'Deuteronomio', 'Dt', 'old', 'Pentateuco', 34, 5, 'Segunda ley: discursos de Moisés antes de entrar en la tierra prometida.', 'Moisés');

-- Libros Históricos (16 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description) VALUES
('joshua', 'Josué', 'Jos', 'old', 'Históricos', 24, 6, 'La conquista de la tierra prometida bajo el liderazgo de Josué.'),
('judges', 'Jueces', 'Jue', 'old', 'Históricos', 21, 7, 'Historia de Israel durante el período de los jueces.'),
('ruth', 'Rut', 'Rt', 'old', 'Históricos', 4, 8, 'Historia de fidelidad y redención de una mujer moabita.'),
('1samuel', '1 Samuel', '1Sa', 'old', 'Históricos', 31, 9, 'Historia del profeta Samuel y el rey Saúl.'),
('2samuel', '2 Samuel', '2Sa', 'old', 'Históricos', 24, 10, 'El reinado del rey David.'),
('1kings', '1 Reyes', '1Re', 'old', 'Históricos', 22, 11, 'Historia de Salomón y la división del reino.'),
('2kings', '2 Reyes', '2Re', 'old', 'Históricos', 25, 12, 'Historia de los reinos divididos hasta el exilio.'),
('1chronicles', '1 Crónicas', '1Cr', 'old', 'Históricos', 29, 13, 'Genealogías y reinado de David.'),
('2chronicles', '2 Crónicas', '2Cr', 'old', 'Históricos', 36, 14, 'Historia del reino de Judá.'),
('ezra', 'Esdras', 'Esd', 'old', 'Históricos', 10, 15, 'El retorno del exilio y la reconstrucción del templo.'),
('nehemiah', 'Nehemías', 'Ne', 'old', 'Históricos', 13, 16, 'La reconstrucción de las murallas de Jerusalén.'),
('tobit', 'Tobías', 'Tb', 'old', 'Históricos', 14, 17, 'Historia de una familia judía en el exilio.'),
('judith', 'Judit', 'Jdt', 'old', 'Históricos', 16, 18, 'Historia de una heroína que salvó a su pueblo.'),
('esther', 'Ester', 'Est', 'old', 'Históricos', 10, 19, 'Historia de la reina Ester que salvó al pueblo judío.'),
('1maccabees', '1 Macabeos', '1Ma', 'old', 'Históricos', 16, 20, 'La revuelta macabea contra el dominio griego.'),
('2maccabees', '2 Macabeos', '2Ma', 'old', 'Históricos', 15, 21, 'Historia paralela de la revuelta macabea.');

-- Libros Sapienciales (7 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description) VALUES
('job', 'Job', 'Jb', 'old', 'Sapienciales', 42, 22, 'Reflexión sobre el sufrimiento del justo.'),
('psalms', 'Salmos', 'Sal', 'old', 'Sapienciales', 150, 23, 'Colección de himnos y oraciones.'),
('proverbs', 'Proverbios', 'Pr', 'old', 'Sapienciales', 31, 24, 'Colección de dichos sabios.'),
('ecclesiastes', 'Eclesiastés', 'Ec', 'old', 'Sapienciales', 12, 25, 'Reflexiones sobre el sentido de la vida.'),
('song', 'Cantar de los Cantares', 'Ct', 'old', 'Sapienciales', 8, 26, 'Poema de amor.'),
('wisdom', 'Sabiduría', 'Sb', 'old', 'Sapienciales', 19, 27, 'Elogio de la sabiduría divina.'),
('sirach', 'Eclesiástico (Sirácida)', 'Si', 'old', 'Sapienciales', 51, 28, 'Instrucciones sapienciales.');

-- Profetas Mayores (6 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description) VALUES
('isaiah', 'Isaías', 'Is', 'old', 'Profetas Mayores', 66, 29, 'Profecías sobre el Mesías y la salvación.'),
('jeremiah', 'Jeremías', 'Jr', 'old', 'Profetas Mayores', 52, 30, 'Profecías durante la caída de Jerusalén.'),
('lamentations', 'Lamentaciones', 'Lm', 'old', 'Profetas Mayores', 5, 31, 'Lamentos por la destrucción de Jerusalén.'),
('baruch', 'Baruc', 'Ba', 'old', 'Profetas Mayores', 6, 32, 'Oración y reflexiones del secretario de Jeremías.'),
('ezekiel', 'Ezequiel', 'Ez', 'old', 'Profetas Mayores', 48, 33, 'Visiones y profecías durante el exilio.'),
('daniel', 'Daniel', 'Dn', 'old', 'Profetas Mayores', 14, 34, 'Visiones apocalípticas y relatos de fidelidad.');

-- Profetas Menores (12 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description) VALUES
('hosea', 'Oseas', 'Os', 'old', 'Profetas Menores', 14, 35, 'El amor fiel de Dios hacia Israel infiel.'),
('joel', 'Joel', 'Jl', 'old', 'Profetas Menores', 4, 36, 'El día del Señor y el derramamiento del Espíritu.'),
('amos', 'Amós', 'Am', 'old', 'Profetas Menores', 9, 37, 'Denuncia de la injusticia social.'),
('obadiah', 'Abdías', 'Ab', 'old', 'Profetas Menores', 1, 38, 'Profecía contra Edom.'),
('jonah', 'Jonás', 'Jon', 'old', 'Profetas Menores', 4, 39, 'La misericordia de Dios para todas las naciones.'),
('micah', 'Miqueas', 'Mi', 'old', 'Profetas Menores', 7, 40, 'Juicio y esperanza para Israel.'),
('nahum', 'Nahúm', 'Na', 'old', 'Profetas Menores', 3, 41, 'Profecía contra Nínive.'),
('habakkuk', 'Habacuc', 'Ha', 'old', 'Profetas Menores', 3, 42, 'Diálogo con Dios sobre la justicia.'),
('zephaniah', 'Sofonías', 'So', 'old', 'Profetas Menores', 3, 43, 'El día del Señor.'),
('haggai', 'Ageo', 'Ag', 'old', 'Profetas Menores', 2, 44, 'Exhortación a reconstruir el templo.'),
('zechariah', 'Zacarías', 'Za', 'old', 'Profetas Menores', 14, 45, 'Visiones mesiánicas.'),
('malachi', 'Malaquías', 'Ml', 'old', 'Profetas Menores', 3, 46, 'Llamado a la fidelidad.');

-- =====================================================
-- NUEVO TESTAMENTO (27 libros)
-- =====================================================

-- Evangelios (4 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description, author) VALUES
('matthew', 'San Mateo', 'Mt', 'new', 'Evangelios', 28, 47, 'Evangelio dirigido a los judíos, presenta a Jesús como el Mesías.', 'Mateo'),
('mark', 'San Marcos', 'Mc', 'new', 'Evangelios', 16, 48, 'Evangelio más breve, presenta a Jesús como el Siervo de Dios.', 'Marcos'),
('luke', 'San Lucas', 'Lc', 'new', 'Evangelios', 24, 49, 'Evangelio dirigido a los gentiles, presenta a Jesús como Salvador universal.', 'Lucas'),
('john', 'San Juan', 'Jn', 'new', 'Evangelios', 21, 50, 'Evangelio teológico, presenta la divinidad de Jesús.', 'Juan');

-- Historia (1 libro)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description, author) VALUES
('acts', 'Hechos de los Apóstoles', 'Hch', 'new', 'Historia', 28, 51, 'Historia de la Iglesia primitiva y la expansión del cristianismo.', 'Lucas');

-- Cartas de San Pablo (13 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description, author) VALUES
('romans', 'Carta a los Romanos', 'Rm', 'new', 'Cartas de San Pablo', 16, 52, 'Exposición sistemática del evangelio de la salvación.', 'Pablo'),
('1corinthians', '1ª Carta a los Corintios', '1Co', 'new', 'Cartas de San Pablo', 16, 53, 'Respuesta a problemas en la comunidad de Corinto.', 'Pablo'),
('2corinthians', '2ª Carta a los Corintios', '2Co', 'new', 'Cartas de San Pablo', 13, 54, 'Defensa del ministerio apostólico de Pablo.', 'Pablo'),
('galatians', 'Carta a los Gálatas', 'Ga', 'new', 'Cartas de San Pablo', 6, 55, 'La libertad cristiana frente a la ley.', 'Pablo'),
('ephesians', 'Carta a los Efesios', 'Ef', 'new', 'Cartas de San Pablo', 6, 56, 'El misterio de Cristo y la Iglesia.', 'Pablo'),
('philippians', 'Carta a los Filipenses', 'Flp', 'new', 'Cartas de San Pablo', 4, 57, 'Alegría y humildad en Cristo.', 'Pablo'),
('colossians', 'Carta a los Colosenses', 'Col', 'new', 'Cartas de San Pablo', 4, 58, 'La supremacía de Cristo.', 'Pablo'),
('1thessalonians', '1ª Carta a los Tesalonicenses', '1Ts', 'new', 'Cartas de San Pablo', 5, 59, 'Esperanza en la venida del Señor.', 'Pablo'),
('2thessalonians', '2ª Carta a los Tesalonicenses', '2Ts', 'new', 'Cartas de San Pablo', 3, 60, 'Corrección sobre la segunda venida.', 'Pablo'),
('1timothy', '1ª Carta a Timoteo', '1Tm', 'new', 'Cartas de San Pablo', 6, 61, 'Instrucciones pastorales.', 'Pablo'),
('2timothy', '2ª Carta a Timoteo', '2Tm', 'new', 'Cartas de San Pablo', 4, 62, 'Testamento espiritual de Pablo.', 'Pablo'),
('titus', 'Carta a Tito', 'Tt', 'new', 'Cartas de San Pablo', 3, 63, 'Organización de la Iglesia en Creta.', 'Pablo'),
('philemon', 'Carta a Filemón', 'Flm', 'new', 'Cartas de San Pablo', 1, 64, 'Intercesión por el esclavo Onésimo.', 'Pablo');

-- Carta a los Hebreos
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description) VALUES
('hebrews', 'Carta a los Hebreos', 'Hb', 'new', 'Cartas Católicas', 13, 65, 'Cristo como sumo sacerdote superior.');

-- Cartas Católicas (7 libros)
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description, author) VALUES
('james', 'Carta de Santiago', 'St', 'new', 'Cartas Católicas', 5, 66, 'La fe que se demuestra en obras.', 'Santiago'),
('1peter', '1ª Carta de San Pedro', '1Pe', 'new', 'Cartas Católicas', 5, 67, 'Esperanza en medio del sufrimiento.', 'Pedro'),
('2peter', '2ª Carta de San Pedro', '2Pe', 'new', 'Cartas Católicas', 3, 68, 'Advertencia contra falsos maestros.', 'Pedro'),
('1john', '1ª Carta de San Juan', '1Jn', 'new', 'Cartas Católicas', 5, 69, 'Dios es amor y luz.', 'Juan'),
('2john', '2ª Carta de San Juan', '2Jn', 'new', 'Cartas Católicas', 1, 70, 'Advertencia sobre engañadores.', 'Juan'),
('3john', '3ª Carta de San Juan', '3Jn', 'new', 'Cartas Católicas', 1, 71, 'Recomendación de hospitalidad.', 'Juan'),
('jude', 'Carta de San Judas', 'Jds', 'new', 'Cartas Católicas', 1, 72, 'Advertencia contra la impiedad.', 'Judas');

-- Libro Profético
INSERT INTO books (id, name, abbreviation, testament, category, total_chapters, order_index, description, author) VALUES
('revelation', 'Apocalipsis', 'Ap', 'new', 'Profético', 22, 73, 'Visiones sobre el fin de los tiempos y el triunfo de Cristo.', 'Juan');

