const playwright = require('playwright');
const fs = require('fs');

async function main() {
    const browser = await playwright.chromium.launch({
        headless: false // setting this to true will not run the UI
    });
   
    const page = await browser.newPage();
    await page.goto("https://www.audible.es/pd/La-llama-de-Focea-Audiolibro/B0BK4J3BQN?ref=a_hp_c6_product_1_1&pf_rd_p=eccc0a2e-f083-4db2-bd64-68c541c9ab0a&pf_rd_r=82NPAG51GK5C577ZZ19X");

    const ul = await page.$$('xpath=//*[@id="center-1"]/div/div[3]/div/div/div/div[2]/span/ul/li');

    let obj = {};

    const titulo = await ul[0].textContent();
    obj['titulo'] = titulo.trim();

    const autor_ = await ul[2].textContent();
    let autor = autor_.trim();
    autor = autor.replace('\n','')
    autor = autor.split(':')[1]
    autor = autor.trim()
    obj['autor'] = autor;

    const narrador_ = await ul[3].textContent();
    let narrador = narrador_.trim();
    narrador = narrador.replace('\n','')
    narrador = narrador.split(':')[1]
    narrador = narrador.trim()
    obj['narrador'] = narrador;


    const idioma = await ul[4].textContent();
    obj['idioma'] = idioma.trim();

    const duracion_ = await ul[5].textContent();
    let duracion = duracion_.trim();
    duracion = duracion.replace('\n','')
    duracion = duracion.split(':')[1]
    duracion = duracion.trim()
    obj['duracion'] = duracion.trim();


    const image = await page.$$('xpath=//*[@id="center-1"]/div/div[3]/div/div/div/div[1]/div/div[1]/img')
    const source = await image[0].getAttribute('src')
    obj['imagen'] = source;


    const description = await page.$$('xpath=//*[@id="center-5"]/div/div/div[1]/span/p')

    let descp = ''
    for(let p of description){
        descp += await p.textContent();
    }

    obj['resumen'] = descp;

    const category = await page.$$('xpath=//*[@id="center-6"]/div/span/ul/li[2]/a');
    const cat = await category[0].textContent();
    obj['categoria'] = cat.trim();


    const genre = await page.$$('.bc-chip-text')
    let generos = [];
    for(let g of genre){
        const g_content = await g.textContent();
        generos.push(g_content.trim())
    }
    obj['genero'] = generos;

    console.log(obj)

    await page.waitForTimeout(5000); // wait for 5 seconds
    await browser.close();
}

main();