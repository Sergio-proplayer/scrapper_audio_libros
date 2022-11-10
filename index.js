const playwright = require('playwright');
const fs = require('fs')
 
let links = [],
categories = []
 
async function main() {
    const browser = await playwright.chromium.launch({
        headless: false // setting this to true will not run the UI
    });
   
    const page = await browser.newPage();
    await page.goto('https://www.audible.es/?ref=a_hp_t1_nav_header_logo&pf_rd_p=fdf7a544-72b7-49ef-8f4c-e650f7f6d896&pf_rd_r=M04TAKM49BW4HPPJVZ20 ');
 
    const bc_link = await page.$$('.bc-link')

    for(let link of bc_link){
      const href = await link.getAttribute('href');
      
      if(href && href.includes('/pd/'))
        links.push('https://www.audible.es/' + href)
    
      else if(href && href.includes('/cat/'))
        categories.push('https://www.audible.es/' + href)
    }
 
    save(links,categories)
 
    await page.waitForTimeout(5000); // wait for 5 seconds
    await browser.close();
}
 
main();
 
function save(links, categories){
    let id = 0;
    let main_links = [],
    cat_links = [];

    for(let link of links){
        const obj = {id,link};
        main_links.push(obj);
        ++id;
    }

    id = 0;
    for(let link of categories){
        const obj = {id,link};
        cat_links.push(obj)
        ++id;
    }
    
    fs.writeFile(`main_links.json`, JSON.stringify(main_links), 'utf-8', err => {
      if(err) {
        console.log('no se guardó el archivo main links')
        throw err;
      }
    })

    
    fs.writeFile(`cat_links.json`, JSON.stringify(cat_links), 'utf-8', err => {
        if(err) {
          console.log('no se guardó el archivo cat links')
          throw err;
        }
    })
 
 
}
