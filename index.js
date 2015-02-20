var _, moment;

_ = window._;
moment = window.moment;

WeatherApiCall = function (options) {
    this.url = "https://api.worldweatheronline.com/free/v2/weather.ashx?key=1d133a0f4175d6de5ff8b237cc245&tp=24&format=json";
    this.options = options;
};

WeatherApiCall.prototype.call = function (callback) {
    var weather, returnValues;
    returnValues = {};
    $.getJSON(this.url, this.options).done(function (data) {
        // avoid having a data key with a value of an object called data
        weather = _.pick(data.data, "current_condition", "weather");
        // make this in to a nice object to work with by picking what we want to use
        returnValues.currentConditions = getCurrentConditions();
        // pass in the array index to reuse the function
        returnValues.tomorrowsConditions = getForcast(1);
        returnValues.twoDayConditions = getForcast(2);

        callback(returnValues);

        function getCurrentConditions() {
            return _.extend(
                // pick from current conditions array
                _.pick(weather.current_condition[0], "temp_C", "windspeedMiles", "weatherCode"),
                // get the description which is very nested
                _.pick(weather.current_condition[0].weatherDesc[0], "value"),
                // find the sunset time
                _.pick(weather.weather[0].astronomy[0], "sunset")
            );
        };

        function getForcast(arrayIndex) {
            return _.extend(
                // find the sunset time
                _.pick(weather.weather[arrayIndex].astronomy[0], "sunset"),
                // pick from the conditions
                _.pick(weather.weather[arrayIndex].hourly[0], "tempC", "windspeedMiles", "weatherCode"),
                // get the description which is very nested
                _.pick(weather.weather[arrayIndex].hourly[0].weatherDesc[0], "value")
            );
        }

    });
};

WeatherApiCall.prototype.setHtml = function () {
    console.log(
        _.each(this.data, function(object){
            // unfortunately will have to use temp_C || tempC in this each loop
            console.log(object);
        })
    );
    $("#weather").html(this);
};

$(document).ready(function () {
    getWeather("leeds", "3");
});

function getWeather(city, days) {
    var apiCall, options;
    options = {
        q: city,
        days: days
    };
    apiCall = new WeatherApiCall(options);
    apiCall.call(function (result) {
        apiCall.data = result;
        apiCall.setHtml();
    });
};