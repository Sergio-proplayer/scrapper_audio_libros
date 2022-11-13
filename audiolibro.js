const playwright = require('playwright');
const fs = require('fs');

async function scraper_audio_libro(browser, link_audio_libro, file) {
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
    const path = './audiolibros/'
    const content = fs.readFileSync('allData.json', 'utf-8')
    
    let current_links = JSON.parse(content).data;
    const total = current_links.length;
    
    const browser = await playwright.chromium.launch({
        headless: true 
    });

    for(let i = 0; i < current_links.length; i++){
        try {
            await scraper_audio_libro(browser, current_links[i], path + `${i}.json`);
            console.log(`${i + 1}/${total} libros guardados`)
        } catch (error) {
            console.log(`Libro Nro. ${i} no fue guardado correctamente`);
            console.log(error);
        }
    }

    
    await browser.close();
}

main();
