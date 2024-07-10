const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set("views", __dirname + "/views");
app.use(express.static( __dirname + "/public"))




app.get("/pkdownload", async (req, res) => {
    const { link } = req.query;

    if (!link) {
        return res.status(400).send("Link query parameter is required");
    }

    try {
        // Fetch the HTML from the provided link
        const { data } = await axios.get(link);

        // Load the HTML into Cheerio
        const $ = cheerio.load(data);

        // Find all links inside the first table
        const downloadLinks = $('table').first().find('a').map((index, element) => {
            const onclickAttr = $(element).attr('onclick');
            if (onclickAttr) {
                // Extract parameters from the onclick attribute
                const params = onclickAttr.match(/'([^']+)'/g).map(param => param.replace(/'/g, ''));
                const id = params[0];
                const mode = params[1];
                const hash = params[2];

                // Return an object with quality and the download link
                return {
                    quality: $(element).text().trim(),
                    id,
                    mode,
                    hash
                };
            }
            return null;
        }).get();

        // Check if any download links were found
        if (downloadLinks.length === 0) {
            return res.status(404).send("No valid download links found on the provided page");
        }

        // Here you can decide how to handle the download links, e.g., render them in another EJS file
        // For now, let's just send them as JSON

        res.render('finaldonwload', { downloadLinks });

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while fetching or parsing the link");
    }

})
app.get("/watchAndDownlaod",async(req,res)=>{
    let {link} = req.query;
    try {
        const { link } = req.query;

        // Fetch the HTML from the given link
        const searchResponse = await axios.get(link);

        console.log(searchResponse.data);
        
        // const $ = cheerio.load(searchResponse.data);

        // console.log($.html);
        res.send("hi")
    } catch (error) {
        
    }
})
app.get("/downlaodmovies", async (req, res) => {
        try {
        const { link } = req.query;

        // Fetch the HTML from the given link
        const searchResponse = await axios.get(link);

        // Load the HTML into Cheerio
        const $ = cheerio.load(searchResponse.data);

        // Extract all the a tags inside the .singcont div
        const links = [];
        $('.singcont a').each((index, element) => {
            const href = $(element).attr('href');
            const text = $(element).text().trim();
            if (href && (href.includes('mixdrop.is') || href.includes('embedpk.net'))) {
                links.push({ href, text });
            }
        });

        // Send the extracted links and their texts as a response
        res.render('downlaod', { links: links });

    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
})


async function ha(req,res) {
            
    const name = req.query?.name || ""
    
    try {
        const url = name.length > 1 ? `https://watch-movies.com.pk/?s=${encodeURIComponent(name)}` : "https://www.watch-movies.com.pk/"
       
        const searchResponse = await axios.get(url);
        const $ = cheerio.load(searchResponse.data);
    
        const movies = [];
        $('.postbox').each((i, element) => {
            const titleElement = $(element).find('.boxtitle a');
            const title = titleElement.attr('title');
            const link = titleElement.attr('href');
            const thumbnail = $(element).find('.thumnail-imagee img').data('src');
            const views = $(element).find('.boxmetadata .views').text().replace('Views : ', '');
    
            movies.push({
                title,
                link,
                thumbnail,
                views,
            });
        });
    
    
        res.render('index', { movies, error: null });
      
    } catch (error) {
        console.error('Error fetching movie data:', error);
        res.status(500).json({ error: 'Failed to fetch movie data' });
    }
    
    }
    
app.get("/search", async(req,res)=>{
    const name = req.query?.name || ""
    
    try {
        const url = name.length > 1 ? `https://watch-movies.com.pk/?s=${encodeURIComponent(name)}` : "https://www.watch-movies.com.pk/"
       
        const searchResponse = await axios.get(url);
        const $ = cheerio.load(searchResponse.data);
    
        const movies = [];
        $('.postbox').each((i, element) => {
            const titleElement = $(element).find('.boxtitle a');
            const title = titleElement.attr('title');
            const link = titleElement.attr('href');
            const thumbnail = $(element).find('.thumnail-imagee img').data('src');
            const views = $(element).find('.boxmetadata .views').text().replace('Views : ', '');
    
            movies.push({
                title,
                link,
                thumbnail,
                views,
            });
        });
    
    
        res.json({movies});
      
    } catch (error) {
        console.error('Error fetching movie data:', error);
        res.status(500).json({ error: 'Failed to fetch movie data' });
    }
    
})
app.get('/movies',(req,res)=>{res.render('d')});





app.get('/pages', async (req,res)=>{

    const {id} = req.query;
    try {
        const url = `https://www.watch-movies.com.pk/page/${id}/`
       
        const searchResponse = await axios.get(url);
        const $ = cheerio.load(searchResponse.data);
    
        const movies = [];
        $('.postbox').each((i, element) => {
            const titleElement = $(element).find('.boxtitle a');
            const title = titleElement.attr('title');
            const link = titleElement.attr('href');
            const thumbnail = $(element).find('.thumnail-imagee img').data('src');
            const views = $(element).find('.boxmetadata .views').text().replace('Views : ', '');
    
            movies.push({
                title,
                link,
                thumbnail,
                views,
            });
        });
    
    
        res.json({movies});
      
    } catch (error) {
        console.error('Error fetching movie data:', error);
        res.status(500).json({ error: 'Failed to fetch movie data' });
    }
});
app.get('/', ha);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

