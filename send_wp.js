import * as fs from 'fs';
import * as http from 'https';
import fetch from 'node-fetch';

const download = (url, file) => {
    return new Promise((resolve, reject) => {
      http.get(url, (res) => {
        if (res.statusCode === 200) {
          res.pipe(fs.createWriteStream(file))
            .on('error', reject)
            .once('close', () => resolve(file));
        } else {
          res.resume();
          reject(new Error('ERROR'));
        }
      })
    })
}


const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3d3dy5kZXNjYXJnYXJhdWRpb2xpYnJvLmNvbSIsImlhdCI6MTY2ODc5Njg5NywibmJmIjoxNjY4Nzk2ODk3LCJleHAiOjE2Njk0MDE2OTcsImRhdGEiOnsidXNlciI6eyJpZCI6IjQifX19.0lRQcKC8oUHsCg_y8ZSV7MjX3R1WtgV8VIpIPrQ8pew'

async function main(n_file){
  try {
    const path = './audiolibros/'
    const content = fs.readFileSync(path + n_file + '.json', 'utf-8')
    const auxTags = ['completo', 'en español', 'en castellano', 'en latino', 'fácil', 'gratis', 'rápido', 'sin publicidad', 'un enlace'];
    let data = await JSON.parse(content);
    const img = data.imagen;
    data.titulo = data.titulo.replace(/ *\[[^\]]*]/g, '').replace(/ *\([^)]*\) */g, "");

    
    const allContent = fs.readFileSync('./allDataWithCategories.json', 'utf-8')
    const allData = await JSON.parse(allContent)

    const fileAux = './imagenes/' + 'aux' + '.jpg'
    await download(img, fileAux)
    const stats = fs.statSync(fileAux);
    const fileSizeInBytes = stats.size;
    const file = fs.createReadStream(fileAux);

    // subir imagen a biblioteca de medios
    const responseImage = await fetch('https://www.descargaraudiolibro.com/wp-json/wp/v2/media', {
      method: 'POST',
      headers: {
        "Content-length": fileSizeInBytes,
        "Content-Type": "image/jpeg",
        "Accept": "application/json",
        'Authorization': `Bearer ${token}`,
        'Content-Disposition': "attachment; filename=" + data.imagen.split('/').at(-1),
      },
      body: file,
    })
    const idImage = await responseImage.json();

    // formateando datos 

    let parrafos = data.descripcion.split('\n');
    let descprition = ''
    parrafos.forEach(p => {
        if(!p.includes('Please'))
        descprition += `<p>${p}</p>`
    });
    

    const title = `Descargar audiolibro ${data.titulo} gratis mp3`;
    const html = `<h1> ${data.titulo} audiolibro descargar gratis. Audiolibro completo en Español y castellano mp3 sin publicidad.</h1>

    ${descprition}

    <img src="${idImage.source_url}" height="250" width="250"/>
    
    <hr />
    
    <h2><strong>Enlace para descargar audiolibro ${data.titulo} completo gratis, en un unico enlace.</strong></h2>
    <strong>Español castellano:</strong>
    
    <a href="${data.link_final}">CLICK AQUÍ PARA DESCARGAR AUDIOLIBRO COMPLETO</a>`

    const categories = allData.data.filter(a => data.link_init === a.url).map(a => a.category)

    const getCategories = await fetch('https://www.descargaraudiolibro.com/wp-json/wp/v2/categories');
    const contentCategories = await getCategories.json();
    const auxCategories = contentCategories.filter(a => categories.includes(a.name));
    let id = 0;

    const tags = auxTags.map(a => `Descargar audiolibro ${data.titulo} ${a}`)

    if (categories.length > 0) {
      if (auxCategories.length === 0) {
        const uCategory = await fetch('https://www.descargaraudiolibro.com/wp-json/wp/v2/categories', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'accept': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              name: categories[0]
            })
        })
        const auxCategory = await uCategory.json();
        id = auxCategory.id;
      } else {
        id = auxCategories[0].id;
      }
    } else {
      id = 1448;
    }

    // subir a wordpress
    await fetch('https://www.descargaraudiolibro.com/wp-json/wp/v2/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'accept': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          content: html,
          status: 'publish',
          featured_media: idImage.id,
          categories: [id],
          terms: {
            "post_tag": tags
          }
        })
    })
    .then(res => console.log('Audiolibro ' + n_file + ' fue publicado con exito! '))
    .catch(err => console.error('Audiolibro ' + n_file + ' tuvo complicaciones\n' + err))
  } catch(err) {
    console.log(`${n_file} ERROR`)
    console.log(err);
    return;
  }
}

for (let i = 10; i < 18303; i++) {
  await main(i)
}
