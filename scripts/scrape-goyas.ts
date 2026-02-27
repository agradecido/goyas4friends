import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const URL = 'https://www.premiosgoya.com/40-edicion/nominaciones/por-categoria/';

// Categorías donde el h2 contiene el título de la película (no el nombre de la persona)
// En estas categorías, la persona está en .lista-de-peliculas__texto p
const MOVIE_LEVEL_CATEGORIES = [
    'mejor película',
    'mejor película de animación',
    'mejor película documental',
    'mejor película iberoamericana',
    'mejor película europea',
    'mejor cortometraje de ficción',
    'mejor cortometraje documental',
    'mejor cortometraje de animación',
];

async function scrape() {
    console.log('🕷️ Iniciando scraping de los Goya...');

    try {
        const { data } = await axios.get(URL, {
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(data);
        const results: any[] = [];

        // Buscamos cada sección de categoría
        $('section.categoria-de-peliculas').each((_, section) => {
            const categoryName = $(section).find('.categoria-de-peliculas__titulo').text().trim();

            console.log(`   📂 Procesando: ${categoryName}`);

            const isMovieLevelCategory = MOVIE_LEVEL_CATEGORIES.includes(categoryName.toLowerCase());
            const nominations: any[] = [];

            // Iteramos los LIs de esa categoría
            $(section).find('li.lista-de-peliculas__pelicula').each((_, li) => {
                // Título de la película: siempre disponible en el slug del enlace
                let movieTitle = $(li).find('a').attr('href')?.split('/').pop()?.replace(/-/g, ' ') || '';
                movieTitle = movieTitle.charAt(0).toUpperCase() + movieTitle.slice(1);

                // h2 contiene el texto del título del enlace (puede ser película o persona)
                const h2Text = $(li).find('h2.lista-de-peliculas__titulo a').text().trim();

                // .lista-de-peliculas__texto p contiene info complementaria
                const textoP = $(li).find('.lista-de-peliculas__texto p').text().trim();

                let person = '';

                if (isMovieLevelCategory) {
                    // En categorías de película, h2 = título película, texto = persona(s)
                    person = textoP || '';
                } else {
                    // En categorías individuales (dirección, actores, técnicos...),
                    // h2 = nombre persona, texto = "Por [película]"
                    person = h2Text || '';
                }

                // Limpiar textos largos de copyright que a veces aparecen
                person = person.replace(/Este contenido es una creación protegida[\s\S]*$/, '').trim();

                if (movieTitle) {
                    nominations.push({
                        movie: movieTitle,
                        person: person || 'Candidatura'
                    });
                }
            });

            if (nominations.length > 0) {
                results.push({
                    category: categoryName,
                    nominations
                });
            }
        });

        console.log(`✅ Scraping completado. ${results.length} categorías encontradas.`);

        await fs.writeFile(
            path.join(process.cwd(), 'goyas_data.json'),
            JSON.stringify(results, null, 2)
        );

        console.log('💾 Datos guardados en goyas_data.json');

    } catch (error) {
        console.error('❌ Error:', error);
    }
}

scrape();
