const articles = [
    {
        title: "THE AKON LIGHTING AFRICA PROJECT BRINGS ELECTRICITY TO AFRICA",
        content: "West Africa has one of the lowest rates of electricity access in the world; only about 42% of the total population and 8% of rural residents have access to electricity.",
        source: "borgenproject.org",
        link: "https://borgenproject.org/electricity-to-africa/",
        image: "../sources/projekt.png" 
    },
    {
        title: "AKON LIGHTING AFRICA - TRANSFORMING AFRICA THROUGH ENERGY",
        content: "We want to light up the whole of Africa. We want to help push this African Renaissance by being able to provide basic services for Africans. We want to help fellow Africans to generate more income through lighting.",
        source: "tapmagonline.com",
        link: "https://www.tapmagonline.com/tap/akon-lighting-africa",
        image: "../sources/cofounder.png"
    }, 
    {
        title: "Checking in on Akon lighting Africa",
        content: "In just one year, Akon’s initiative was a smashing success by providing 14 African nations, including Guinea, Senegal, and Sierra Leone, with sustainable, solar-powered electricity via street lamps and solar panels.",
        source: "pv-magazine-usa.com",
        link: "https://pv-magazine-usa.com/2020/10/15/checking-in-on-akon-lighting-africa/",
        image: "../sources/image.png"
    },
    {
        title: "Akon is Lighting Africa Through the Use of Solar Energy",
        content: "By providing these countries and villages with electricity through solar panels, the ultimate goal is to create direct and indirect jobs. Because these villages will be illuminated at night, shops and vendors can continue business while also creating a safer environment for children and other members of the community.",
        source: "solup.com",
        link: "https://solup.com/akon-is-lighting-africa-through-the-use-of-solar-energy/",
        image: "../sources/solar.png"
    },
    {
        title: "Sustainable energy solutions: Akon Lighting Africa",
        content: "The project is unique. It was established by the children of Africa who are aware of the hardships of having limited to no electricity",
        source: "researchgate.net",
        link: "https://www.researchgate.net/publication/335736428_Sustainable_energy_solutions_Akon_Lighting_Africa",
        image: "../sources/model.png"
    },
    {
        title:"Activating Africa",
        content: "Children can effectively study at night when they previously had to sit in a small kerosene-lit room reading through thick and toxic smoke. African women can leave their houses when it's dark out with sense of security. In one area, crime decreased by 90 % once our light went up",
        source: "real-leaders.com/akon-magazine/",
        linkt:"https://real-leaders.com/akon-magazine/4/",
        image:"../sources/acon.png"
    }

];
    function loadArticles() {
        const container = document.getElementById('articlesContainer');
    
        articles.forEach(article => {
            const articleElement = document.createElement('div');
            articleElement.className = 'article';
    
            const imageElement = document.createElement('img');
            imageElement.src = article.image;
            imageElement.alt = article.title;
    
            const articleContent = document.createElement('div');
            articleContent.className = 'article-content';
    
            const titleElement = document.createElement('h2');
            titleElement.textContent = article.title;
    
            const contentElement = document.createElement('p');
            contentElement.textContent = article.content;
    
            const sourceElement = document.createElement('div');
            sourceElement.className = 'source';
            sourceElement.innerHTML = `Source: <a href="${article.link}" target="_blank">${article.source}</a>`;
    
            articleContent.appendChild(titleElement);
            articleContent.appendChild(contentElement);
            articleContent.appendChild(sourceElement);
    
            articleElement.appendChild(imageElement);
            articleElement.appendChild(articleContent);
    
            container.appendChild(articleElement);
        });
    }
    
    window.onload = loadArticles; // loading articles
    