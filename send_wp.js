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


const token = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL3d3dy5kZXNjYXJnYXJhdWRpb2xpYnJvLmNvbSIsImlhdCI6MTY2ODUyODEyNywibmJmIjoxNjY4NTI4MTI3LCJleHAiOjE2NjkxMzI5MjcsImRhdGEiOnsidXNlciI6eyJpZCI6IjQifX19.B_lU-n6VyuofFkb9naiD6xBr7bfogAHNV1-ZF5W9k-A'

async function main(n_file){
    const path = './audiolibros/'
    const content = fs.readFileSync(path + n_file + '.json', 'utf-8')
    const data = await JSON.parse(content);
    const img = data.imagen;

    const fileAux = './imagenes/' + n_file + '.jpg'
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
          status: 'draft',
          featured_media: idImage.id,
        })
    })
    .then(res => console.log('Audiolibro ' + n_file + ' fue publicado con exito! '))
    .catch(err => console.error('Audiolibro ' + n_file + ' tuvo complicaciones\n' + err))
}

main(0)
