let actorsData, lastFunctionCall;
let currentStatus = "nominees";
const minYear = 1950;
const maxYear = 2018;

const svg = d3.select("#map")
    .append("svg")
    .attr("id", "projection")
    .attr("width", 960)
    .attr("height", 600);

const tooltip = d3.select("#map")
    .append("div")
    .attr("id", "tooltip")

const path = d3.geoPath();


// Draw map and fill with initial values
d3.json("data/usa-map.json")
    .then(data => {
        const states = topojson.feature(data, data.objects.states);

        d3.json("data/actors-states.json").then(actors => {
            actorsData = actors;

            svg.selectAll("path")
                .data(states.features)
                .enter()
                .append("path")
                .attr("class", "state")
                .attr("d", path);

            fillMap(minYear, maxYear);
        })
    });


// Selecting "Nominees" or "Winners"
document.querySelectorAll(".option").forEach(option => {

    option.addEventListener("click", () => {
        document.querySelector(".selected").classList.remove("selected");
        option.classList.add("selected");
        currentStatus = option.id;
        document.querySelector(".title span").textContent = currentStatus === "nominees" ? "Nominated" : "Winning";

        if (lastFunctionCall) {
            lastFunctionCall.functionName(lastFunctionCall.parameter1, lastFunctionCall.parameter2)
        } else {
            fillMap(minYear, maxYear);
        }
    })
})



// Slider for selected year
const yearSlider = document.querySelector("#yearSlider");

noUiSlider.create(yearSlider, {
    start: [2000],
    step: 1,
    format: {
        to: function (value) {
            return value;
        },
        from: function (value) {
            return Number(value);
        }
    },
    tooltips: true,
    range: {
        "min": minYear,
        "max": maxYear
    }
});

yearSlider.noUiSlider.on("change", function () {
    clearActorInfo();

    const year = yearSlider.noUiSlider.get();
    document.querySelector("#yearRange span").textContent = year;
    selectYear(year);

    lastFunctionCall = {
        functionName: selectYear,
        parameter1: year,
        parameter2: ""
    }
});



// Slider for selected year range
const yearRangeSlider = document.querySelector("#yearRangeSlider");

noUiSlider.create(yearRangeSlider, {
    start: [minYear, maxYear],
    connect: true,
    step: 1,
    margin: 2,
    tooltips: true,
    format: {
        to: function (value) {
            return value;
        },
        from: function (value) {
            return Number(value);
        }
    },
    range: {
        "min": minYear,
        "max": maxYear
    }
});

yearRangeSlider.noUiSlider.on("change", function (values) {
    clearActorInfo();

    document.querySelector("#yearRange span").textContent = `${values[0]} - ${values[1]}`;
    fillMap(values[0], values[1]);

    lastFunctionCall = {
        functionName: fillMap,
        parameter1: values[0],
        parameter2: values[1]
    }
})

