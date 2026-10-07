# Simone Rega — sito personale

Homepage statica pubblicata su GitHub Pages dal branch `main`, senza build o backend.

## Modificare la mappa

Modifica `assets/data/travels.json`. Ogni oggetto in `destinations` rappresenta un luogo già visitato:

```json
{
  "destinations": [
    {
      "id": "miami",
      "name": "Miami",
      "country": "Stati Uniti",
      "latitude": 25.7617,
      "longitude": -80.1918,
      "year": 2026,
      "note": "Un ricordo del viaggio."
    }
  ]
}
```

`id` deve essere unico. Latitudine e longitudine sono numeri (non stringhe), rispettivamente tra -85 e 85 e tra -180 e 180. `year` e `note` sono facoltativi. `mapRegions` è un elenco facoltativo dei nomi dei paesi nel dataset `world-paths.json`, utilizzato per evidenziare le aree visitate. Per Inghilterra e Florida rimane il solo punto, così non si evidenziano tutto il Regno Unito o tutti gli Stati Uniti. Usa solo destinazioni già visitate. Un elenco vuoto è supportato; elementi non validi vengono ignorati. Le stringhe sono inserite come testo, mai come HTML. Salva su `main`: GitHub Pages aggiorna automaticamente il sito. Le 12 destinazioni iniziali sono quelle indicate da Simone: Italia, Inghilterra, Romania, Repubblica Ceca, Ungheria, Spagna, Francia, Austria, Germania, Florida, Svezia e Giappone. I punti rappresentano le destinazioni, non città o itinerari specifici.

## Link ai progetti

Le card in `index.html` puntano al canale YouTube e ai repository ufficiali UltraPad e NextBite. Non essendo disponibili URL pubblici di deploy verificati, non sono stati inventati indirizzi. Per collegare le app pubblicate, sostituisci l'attributo `href` delle rispettive card.

## File principali

- `index.html`: contenuti, card e struttura accessibile.
- `assets/css/personal.css`: stile responsive e supporto movimento ridotto.
- `assets/js/personal.js`: caricamento JSON, selezione accessibile e zoom.
- `assets/data/world-paths.json`: geometria locale della mappa, senza servizi di tile o chiavi API.

Geometria derivata dal dataset GeoJSON di Natural Earth distribuito da [D3 Graph Gallery](https://github.com/holtzy/D3-graph-gallery/blob/master/DATA/world.geojson). Natural Earth è di pubblico dominio. Proiezione equirettangolare, Antartide omessa.

## Anteprima locale

```sh
python -m http.server 8000
```

Apri `http://localhost:8000`. Usa un server HTTP perché la mappa carica i file JSON tramite fetch.

Sito personale: https://simorega.github.io/
