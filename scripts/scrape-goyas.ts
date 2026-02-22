import axios from 'axios';
import * as cheerio from 'cheerio';
import fs from 'fs/promises';
import path from 'path';

const URL = 'https://www.premiosgoya.com/40-edicion/nominaciones/por-categoria/';

async function scrape() {
  console.log('🕷️ Iniciando scraping de los Goya (Intento 2)...');
  
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

        const nominations: any[] = [];
        
        // Iteramos los LIs de esa categoría
        $(section).find('li.lista-de-peliculas__pelicula').each((_, li) => {
            
            // Título: A veces está en un H2, a veces hay que sacarlo del ALT de la imagen
            // En el HTML que vi, parece que hay un enlace con la imagen.
            // Vamos a buscar el título en <h2 class="lista-de-peliculas__titulo-pelicula"> si existe, o en el alt.
            
            // Intento 1: Buscar texto del enlace
            let movieTitle = $(li).find('a').attr('href')?.split('/').pop()?.replace(/-/g, ' ') || '';
            
            // Capitalizar título (casa-en-flames -> Casa en flames)
            movieTitle = movieTitle.charAt(0).toUpperCase() + movieTitle.slice(1);

            // Nominado (Persona): suele estar en un párrafo dentro de 'lista-de-peliculas__texto'
            let nominee = $(li).find('.lista-de-peliculas__texto p').text().trim();
            
            // Limpieza: "Por Marco" -> "Marco" (si es redundante, lo dejamos)
            nominee = nominee.replace(/^Por\s+/, '').trim();

            if (movieTitle) {
                nominations.push({
                    movie: movieTitle,
                    person: nominee || 'Candidatura'
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
