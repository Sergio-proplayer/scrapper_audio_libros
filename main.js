import playwright from 'playwright';
import * as fs from 'fs';
import { fileURLToPath } from 'url';
import * as https from 'https';
import fecth from 'node-fetch';
import path from 'path';

//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);

async function scraper_audio_libro(link_audio_libro, file) {
    const browser = await playwright.chromium.launch({
        headless: false,
    });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.goto(link_audio_libro, {timeout: 400000});

    let obj = {};

    const titulo_ = await page.$('#productTitle');
    let titulo = await titulo_.textContent();
    obj['titulo'] = titulo.trim();

    const img_ettiquete = await page.$('#main-image')
    const imagen = await img_ettiquete.getAttribute('src')
    obj['imagen'] = imagen;

    const descripcion_ = await page.$$('xpath=//*[@id="bookDescription_feature_div"]/div/div[1]/p')
    let descripcion = ''
    for(let p of descripcion_) {
        let content = await p.textContent();
        if(content != 'Please note: This audiobook is in Spanish.')
            descripcion += content + '\n';
    }
    obj['descripcion'] = descripcion;

    obj['link_init'] = link_audio_libro;
    
    const id = link_audio_libro.split('/dp/')[1].split('/')[0]
    obj['link_final'] = `https://www.amazon.com/hz/audible/mlp/mfpdp/${id}?actionCode=AMSTM1450129210001`

    save(obj, file)

    await page.close();
    await context.close();
    await browser.close()
}

function save(obj, file){
    fs.writeFile(file, JSON.stringify(obj), 'utf-8', err => {
        if(err) {
          console.log('Error')
          throw err;
        }
      })
}


/* guardadon archivos */

async function main(){
    // Cambiar nombre de la carpeta
    const urlAux  = './audiolibros/'
    const content = fs.readFileSync('allData.json', 'utf-8')
    
    let current_links = JSON.parse(content).data;
    const total = current_links.length;
    
    //const browser = await playwright.chromium.launch({
    //    headless: true 
    //});

    for(let i = 0; i < current_links.length; i++){
        try {
            await scraper_audio_libro(current_links[i], urlAux  + `${i}.json`);
            console.log(`${i}/${total} libros guardados`)
        } catch (error) {
            console.log(`Libro Nro. ${i} no fue guardado correctamente`);
            //console.err(error);
        }
    }

    
    await browser.close();
}

const aux = async () => {
  const urlAux = './audiolibros/'
  const content = fs.readFileSync('allData.json', 'utf-8')
  let current_links = JSON.parse(content).data;
  const total = current_links.length;
	for (let i = 0; i < 4000; i++) {
		try {
    	fs.readFileSync(`audiolibros/${i}.json`, 'utf-8')
		} catch(err) {
      await scraper_audio_libro(current_links[i], urlAux  + `${i}.json`);
      console.log(`${i}/${total} libros guardados`)
      //console.log(i);
		}
	}
}

const getToken = async () => {
  const cred = {
    username: 'Creador',
    password: 'forobeta12345',
  }

  const response = await fetch('https://www.descargaraudiolibro.com/wp-json/jwt-auth/v1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'accept': 'application/json'
    },
    body: JSON.stringify(cred),
  })

  const token = await response.json();
  console.log(token);
  return token;
}

const auxIngles = async () => {
  const urlAux = './audiolibros/'
  const content = fs.readFileSync('allData.json', 'utf-8')
  let current_links = JSON.parse(content).data;
  const total = current_links.length;
	for (let i = 0; i < 4000; i++) {
		try {
    	const data = fs.readFileSync(`audiolibros/${i}.json`, 'utf-8')
      let content = JSON.parse(data);
      let titulo = content.titulo;
      titulo = titulo.replace(/ *\[[^\]]*]/g, '')
      titulo = titulo.replace(/ *\([^)]*\) */g, "")
      console.log(`${content.titulo} -> ${titulo}`);
		} catch(err) {
      console.log(`${i}/${total} Error`)
      //console.log(i);
		}
	}
}

//main();
auxIngles();
//const token = await getToken();
//console.log(token);
