## Choropleth USA Map - Home State of Best American Actors

An interactive map showing the home state of American actors who were nominated or won an Academy Award for Best Actor / Actress from 1950 to 2018.
Built with [d3.js](https://d3js.org/) and [noUiSlider](https://refreshless.com/nouislider/).



### Live Demo
https://lera409.github.io/oscars-usa-map/



### Data Sources
1. [topjson/usa-atlas](https://github.com/topojson/us-atlas) - geographic data for the USA map
2. [Wikdata](https://www.wikidata.org/) - fetch nominees and winners of the Award through [SPARQL Queries](https://query.wikidata.org/) (see `\data\wikidata.txt` file)
3. [MediaWiki API](https://www.mediawiki.org/wiki/API:Main_page) - fetch actor details (photo, description and link to their Wikipedia page)  



### How to Use
1. Switch between Nominees and Winners at any time.
2. Use the first slider to change the year range of the choropleth map. Hover over a state to see the number of actors born there.
3. Use the second slider to see the nominees/winners for a particular year. Hover over a state to see the actor(s) and the movie they were awarded for. A click on the actor's name will show more details in the lower right corner.



### Preview
<img src="/images/screenshot-1.png"><img src="/images/screenshot-2.png">
