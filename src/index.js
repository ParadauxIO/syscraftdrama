const { randomIndex, randomEntry } = require("./util");
const { combinations, sentences, social } = require("./data.json");

function renderDrama(message, share, sharePath, teaser) {
    return `
<!DOCTYPE html>
    <head>
        <title>larrygenerator</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
        <meta name="description" content="True stories about Larry!"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <meta name="og:title" content="${teaser}"/>
        <meta name="og:type" content="website"/>
        <meta name="og:url" content="${share}"/>
        <meta name="og:site_name" content="Larry Generator"/>
        <meta name="og:description" content="${message}"/>

        <link rel="icon" href="data:,">
        <style>
            body { 
                padding-top:50px; 
                background-color: #121212;
                color: white;
            }
        </style>

        <script>
            const konami = ["l", "a", "r", "r", "y", "."];
            const inputs = ["", "", "", "", "", ""]

            function pushInput(key) {
                inputs.shift();
                inputs.push(key);
            }

            function checkInputs() {
                for (i in inputs) {
                    if (konami[i] != inputs[i]) {
                        return false;
                    }
                }
                return true;
            }

            function onLoad() {
                window.history.replaceState({}, "", "${sharePath}");
            }

            function onKeyDown(e) {
                pushInput(e.key);

                if (checkInputs()) {
                    document.getElementById("larry").innerHTML = "<img src=\\"https://media3.giphy.com/media/mAyKtbkBTTpFm/giphy.gif\\" alt=\\"LARRYY!\\"/>"
                }

                if (e.key == "Enter") {
                    window.location = "/";
                }
            }

            window.onload = onLoad;
            window.onkeydown = onKeyDown;
        </script>
    </head>
    
    <body class="container">
        <main>
            <div class="jumbotron" style="background-color:#1D1D1D;">
                <h1>larrygenerator.com</h1>
                <hr>
                <span id="larry"></span>
                <h3>${message}</h3>  
                <button type="button" class="btn btn-dark" onclick="location.href='/';">learn more about larry</button>
            </div>
        </main>

        <footer>
            <a href="https://syscraft.org" class="text-center text-muted">Syscraft is fully endorsed by LLS/LLM Conglomerate.</a>
        </footer>
    </body>

</html>
    `
}

function handleRoot(url) {
    let drama = {};

    drama.sentence = randomIndex(sentences);

    for (key in combinations) {
        drama[key] = [randomIndex(combinations[key]), randomIndex(combinations[key]), randomIndex(combinations[key]), randomIndex(combinations[key])];
    }

    const dramaUrl = btoa(JSON.stringify(drama));
    const host = url.host == "example.com" ? "localhost:8787" : url.host;

    return handleDrama(new URL(`${url.protocol}//${host}/${dramaUrl}`));
}

function handleDrama(url) {
    try {
        let dramaIds = JSON.parse(atob(url.pathname.split("/")[1]));
        let usedDramaIds = { sentence: dramaIds.sentence };
        let message = sentences[dramaIds.sentence];

        for (key in combinations) {
            const placeholder = `[${key}]`;
            if (!message.includes(placeholder)) continue;
            usedDramaIds[key] = [];
            for (id of dramaIds[key]) {
                if (!message.includes(placeholder)) continue;
                usedDramaIds[key].push(id);

                const replacement = combinations[key][id];
                message = message.replace(placeholder, replacement);
            }
        }

        url.pathname = "/" + btoa(JSON.stringify(usedDramaIds));

        let teaser = randomEntry(social);

        return new Response(renderDrama(message, url.href, url.pathname, teaser), {
            headers: {
                "content-type": "text/html;charset=utf8"
            }
        });
    } catch (error) {
        return handle404();
    }
}

function handle404() {
    return new Response("no u", {
        status: "404"
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
    let url = new URL(request.url);
    if (url.pathname == "/") {
        return handleRoot(url);
    } else if (url.pathname == "/favicon.ico") {
        return handle404();
    } else {
        return handleDrama(url);
    }
}
