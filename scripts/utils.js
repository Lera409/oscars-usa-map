const getColorScheme = () => currentStatus === "nominees" ? d3.schemeBlues[9] : d3.schemeOranges[9];

const getPrimaryColor = () => getColorScheme()[5];

const getNounForm = (noun, number) => number === 1 ? noun.slice(0, -1) : noun;

const clearActorInfo = () => {
    const actorCard = d3.select(".actor-card");
    if (actorCard) actorCard.html("");
}

const showTooltip = (mouseEvent, text) => {
    tooltip.classed("active", true)
        .style("left", (mouseEvent.pageX + 5) + "px")
        .style("top", (mouseEvent.pageY - 28) + "px");
    tooltip.html(text);
}

const hideTooltip = () => {
    tooltip.classed("active", false);
}

const fillMap = (startYear, endYear) => {
    const selectedStatus = getNounForm(currentStatus, 1);
    const actorsInRange = actorsData.reduce((accumulator, actor) => {
        if (actor.status === selectedStatus && +actor.year >= startYear && +actor.year <= endYear) {
            const state = actor.state;
            accumulator[state] = (accumulator[state] || 0) + 1;
        }
        return accumulator;
    }, {});

    const colorScheme = d3.scaleThreshold()
        .domain([1, 3, 5, 10, 15, 20, 40, 80])
        .range(getColorScheme());

    svg.selectAll("path")
        .attr("fill", state => {
            const stateName = state.properties.name;
            actorsInRange[stateName] = actorsInRange[stateName] || 0;
            const actorCount = actorsInRange[stateName];
            return colorScheme(actorCount);
        })
        .on("mouseover", function (mouseEvent, state) {
            const stateName = state.properties.name;
            const actorCount = actorsInRange[stateName];
            const tooltipText = `<p class="state-name">${stateName}</p>
                                 <p>${actorCount} ${getNounForm(currentStatus, actorCount)}</p>`;
            showTooltip(mouseEvent, tooltipText);
        })
        .on("mouseout", hideTooltip);

    addLegend(colorScheme);
}

const addLegend = (colorScheme) => {
    const legendText = ["0", "1", "< 3", "< 5", "< 10", "< 20", "< 40", "< 80", "> 80"];
    let legend = d3.select("#legend");

    if (legend.empty()) {
        legend = d3.select("#map").append("svg")
            .attr("id", "legend")
            .attr("width", 80)
            .attr("height", 200)
            .selectAll("g")
            .data([0, ...colorScheme.domain()])
            .enter()
            .append("g")
            .attr("transform", (xCoord, yCoord) => `translate(0, ${yCoord * 20})`);

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", colorScheme);

        legend.append("text")
            .data(legendText)
            .attr("x", 25)
            .attr("y", 9)
            .attr("dy", "4px")
            .text(legendTextItem => legendTextItem);
    }
    else {
        legend.selectAll("rect")
            .style("fill", colorScheme);
    }

    legend.style("display", "block");
}

const selectYear = (year) => {
    d3.select("#legend").style("display", "none");

    const primaryColor = getPrimaryColor();
    const disabledColor = "#e5e1e1";

    let selectedStates = {};
    const selectedStatus = getNounForm(currentStatus, 1);
    const selectedActors = actorsData.filter(actor => actor.year == year && actor.status === selectedStatus);

    svg.selectAll("path")
        .attr("fill", state => {
            const stateName = state.properties.name;
            const actorsFromState = selectedActors.filter((actor) => actor.state === stateName);
            if (actorsFromState.length) {
                selectedStates[stateName] = actorsFromState;
                return primaryColor;
            }
            else {
                return disabledColor;
            }
        })
        .on("mouseover", (mouseEvent, state) => {
            hideTooltip();
            const stateName = state.properties.name;
            if (stateName in selectedStates) {
                const actorsFromState = selectedStates[stateName];
                const tooltipText = actorsFromState.reduce((accumulator, actor) => {
                    const actorName = actor.actor;
                    accumulator += `<p class="state-actor"><span onclick="getActorInfo('${actorName}')">${actor.actor}</span> - ${actor.movie}</p>`;
                    return accumulator;
                }, `<p class="state-name">${stateName}</p>`);
                showTooltip(mouseEvent, tooltipText);
            }
        })
        .on("mouseout", null);

    tooltip.on("mouseleave", (mouseEvent, state) => {
        hideTooltip();
    });

}

const getActorInfo = (actor) => {
    const baseUrl = "https://en.wikipedia.org/w/api.php";
    const urlParams = "?format=json&origin=*&action=query" +
        "&prop=extracts|pageimages&exintro&explaintext&exchars=300" +
        "&generator=search&gsrlimit=1&redirects=1" +
        "&piprop=thumbnail&pilimit=max&pithumbsize=200";
    const searchTerm = `&gsrsearch=intitle:${encodeURI(actor)}`;
    const requestUrl = `${baseUrl}${urlParams}${searchTerm}`;

    fetch(requestUrl)
        .then(response => response.json())
        .then(json => {
            const actorData = {};
            const jsonInfo = json.query.pages;
            for (var key in jsonInfo) {
                if (jsonInfo.hasOwnProperty(key)) {
                    const jsonData = jsonInfo[key];
                    actorData.name = jsonData.title;
                    actorData.link = "https://en.wikipedia.org/wiki/" + actorData.name;
                    if (jsonData.thumbnail) {
                        actorData.imageUrl = jsonData.thumbnail.source;
                    }
                    actorData.description = jsonData.extract;
                    populateActorCard(actorData);
                }
            }
        });
}

const populateActorCard = (actorData) => {
    const actorCard = d3.select('.actor-card');
    actorCard.html('');

    if (actorData.imageUrl) {
        actorCard.append('img').attr('src', actorData.imageUrl);
    }
    const actorText = actorCard.append('div').attr("class", "content");
    actorText.append('a').attr("target", "_blank").attr('href', actorData.link).text(actorData.name);
    actorText.append('p').text(actorData.description);
}
