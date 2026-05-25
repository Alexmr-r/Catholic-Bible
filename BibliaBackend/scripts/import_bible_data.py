#!/usr/bin/env python3
"""
Script para importar datos de la Biblia desde bible_raw.json a PostgreSQL
"""
import json
import psycopg2
from psycopg2.extras import execute_values
import sys
import os

# Configuración de la base de datos
DB_CONFIG = {
    'host': '127.0.0.1',
    'port': 5432,
    'database': 'biblia_db',
    'user': 'biblia_prod_user',
    'password': 'una_contrasena_dificil_para_la_db_2026'
}

# Mapeo de nombres de libros del JSON a IDs en la base de datos
BOOK_NAME_TO_ID = {
    'Genesis': 'genesis',
    'Exodus': 'exodus',
    'Leviticus': 'leviticus',
    'Numbers': 'numbers',
    'Deuteronomy': 'deuteronomy',
    'Joshua': 'joshua',
    'Judges': 'judges',
    'Ruth': 'ruth',
    'I Samuel': '1samuel',
    'II Samuel': '2samuel',
    'I Kings': '1kings',
    'II Kings': '2kings',
    'I Chronicles': '1chronicles',
    'II Chronicles': '2chronicles',
    'Ezra': 'ezra',
    'Nehemiah': 'nehemiah',
    'Tobit': 'tobit',
    'Judith': 'judith',
    'Esther': 'esther',
    'I Maccabees': '1maccabees',
    'II Maccabees': '2maccabees',
    'Job': 'job',
    'Psalms': 'psalms',
    'Proverbs': 'proverbs',
    'Ecclesiastes': 'ecclesiastes',
    'Song of Solomon': 'song',
    'Wisdom': 'wisdom',
    'Sirach': 'sirach',
    'Isaiah': 'isaiah',
    'Jeremiah': 'jeremiah',
    'Lamentations': 'lamentations',
    'Baruch': 'baruch',
    'Ezekiel': 'ezekiel',
    'Daniel': 'daniel',
    'Hosea': 'hosea',
    'Joel': 'joel',
    'Amos': 'amos',
    'Obadiah': 'obadiah',
    'Jonah': 'jonah',
    'Micah': 'micah',
    'Nahum': 'nahum',
    'Habakkuk': 'habakkuk',
    'Zephaniah': 'zephaniah',
    'Haggai': 'haggai',
    'Zechariah': 'zechariah',
    'Malachi': 'malachi',
    'Matthew': 'matthew',
    'Mark': 'mark',
    'Luke': 'luke',
    'John': 'john',
    'Acts': 'acts',
    'Romans': 'romans',
    'I Corinthians': '1corinthians',
    'II Corinthians': '2corinthians',
    'Galatians': 'galatians',
    'Ephesians': 'ephesians',
    'Philippians': 'philippians',
    'Colossians': 'colossians',
    'I Thessalonians': '1thessalonians',
    'II Thessalonians': '2thessalonians',
    'I Timothy': '1timothy',
    'II Timothy': '2timothy',
    'Titus': 'titus',
    'Philemon': 'philemon',
    'Hebrews': 'hebrews',
    'James': 'james',
    'I Peter': '1peter',
    'II Peter': '2peter',
    'I John': '1john',
    'II John': '2john',
    'III John': '3john',
    'Jude': 'jude',
    'Revelation': 'revelation',
    'Revelation of John': 'revelation'
}


def connect_db():
    """Conectar a la base de datos PostgreSQL"""
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        print("✓ Conectado a la base de datos")
        return conn
    except Exception as e:
        print(f"✗ Error conectando a la base de datos: {e}")
        sys.exit(1)


def load_bible_json(file_path):
    """Cargar el archivo JSON de la Biblia"""
    try:
        print(f"Cargando archivo: {file_path}")
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        # El JSON tiene estructura: {"translation": "...", "books": [...]}
        if isinstance(data, dict) and 'books' in data:
            books = data['books']
            print(f"✓ Archivo cargado: {len(books)} libros encontrados")
            print(f"  Traducción: {data.get('translation', 'N/A')}")
            return books
        else:
            print(f"✗ Estructura de JSON inesperada")
            sys.exit(1)
    except Exception as e:
        print(f"✗ Error cargando archivo JSON: {e}")
        sys.exit(1)


def clear_bible_data(conn):
    """Limpiar datos existentes de capítulos y versículos"""
    cursor = conn.cursor()
    try:
        print("\nLimpiando datos existentes...")
        cursor.execute("DELETE FROM verses")
        cursor.execute("DELETE FROM sections")
        cursor.execute("DELETE FROM chapters")
        conn.commit()
        print("✓ Datos limpiados")
    except Exception as e:
        conn.rollback()
        print(f"✗ Error limpiando datos: {e}")
        raise
    finally:
        cursor.close()


def import_book_data(conn, book_data):
    """Importar datos de un libro (capítulos y versículos)"""
    cursor = conn.cursor()

    book_name = book_data.get('name')
    book_id = BOOK_NAME_TO_ID.get(book_name)

    if not book_id:
        print(f"⚠ Advertencia: Libro '{book_name}' no mapeado, saltando...")
        return 0, 0

    # Verificar que el libro existe en la tabla books
    cursor.execute("SELECT id FROM books WHERE id = %s", (book_id,))
    if not cursor.fetchone():
        print(f"⚠ Advertencia: Libro '{book_id}' no existe en la BD, saltando...")
        return 0, 0

    chapters = book_data.get('chapters', [])
    total_verses = 0

    for chapter_data in chapters:
        chapter_number = chapter_data.get('chapter')
        verses = chapter_data.get('verses', [])

        # Insertar capítulo
        cursor.execute("""
            INSERT INTO chapters (book_id, chapter_number, version)
            VALUES (%s, %s, 'Biblia de Jerusalén')
            RETURNING id
        """, (book_id, chapter_number))

        chapter_id = cursor.fetchone()[0]

        # Crear una sección por capítulo (sin título específico)
        cursor.execute("""
            INSERT INTO sections (chapter_id, title, order_index)
            VALUES (%s, '', 1)
            RETURNING id
        """, (chapter_id,))

        section_id = cursor.fetchone()[0]

        # Preparar versículos para inserción batch
        verse_values = [
            (section_id, verse.get('verse'), verse.get('text', '').strip(), False, None)
            for verse in verses
        ]

        # Insertar versículos en batch
        execute_values(cursor, """
            INSERT INTO verses (section_id, verse_number, text, has_note, note_text)
            VALUES %s
        """, verse_values)

        total_verses += len(verses)

    conn.commit()
    return len(chapters), total_verses


def main():
    # Rutas de archivos
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    json_file = os.path.join(os.path.dirname(project_root), 'BibliaAppExpo', 'bible_raw.json')

    if not os.path.exists(json_file):
        print(f"✗ Archivo no encontrado: {json_file}")
        sys.exit(1)

    print("=" * 60)
    print("IMPORTACIÓN DE DATOS DE LA BIBLIA")
    print("=" * 60)

    # Conectar a la base de datos
    conn = connect_db()

    try:
        # Cargar JSON
        bible_data = load_bible_json(json_file)

        # Limpiar datos existentes
        clear_bible_data(conn)

        # Importar cada libro
        print("\nImportando libros...")
        print("-" * 60)

        total_books = 0
        total_chapters = 0
        total_verses = 0

        for i, book_data in enumerate(bible_data, 1):
            book_name = book_data.get('name', 'Unknown')
            print(f"\n[{i}/{len(bible_data)}] Procesando: {book_name}")

            chapters, verses = import_book_data(conn, book_data)

            if chapters > 0:
                total_books += 1
                total_chapters += chapters
                total_verses += verses
                print(f"  ✓ {chapters} capítulos, {verses} versículos importados")

        print("\n" + "=" * 60)
        print("RESUMEN DE IMPORTACIÓN")
        print("=" * 60)
        print(f"Libros importados:     {total_books}")
        print(f"Capítulos importados:  {total_chapters}")
        print(f"Versículos importados: {total_verses}")
        print("=" * 60)
        print("\n✓ Importación completada exitosamente!")

    except Exception as e:
        print(f"\n✗ Error durante la importación: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()


if __name__ == '__main__':
    main()

