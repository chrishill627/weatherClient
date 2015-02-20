var _, moment;

_ = window._;
moment = window.moment;

WeatherApiCall = function (options) {
    this.url = "https://api.worldweatheronline.com/free/v2/weather.ashx?key=1d133a0f4175d6de5ff8b237cc245&tp=24&format=json";
    this.options = options;
};

WeatherApiCall.prototype.call = function (callback) {
    var weather, returnValue, self;
    self = this;
    $.getJSON(this.url, this.options).done(function (data) {
        // avoid having a data key with a value of an object called data
        weather = _.pick(data.data, "current_condition", "weather");
        // make this in to a nice object to work with by picking what we want to use

        switch(self.options.reportFor) {
            case "today":
                returnValue = getCurrentConditions();
                break;
            case "tomorrow":
                // pass in the array index to reuse the function
                returnValue = getForcast(1);
                break;
            case "twoDay":
                returnValue = getForcast(2);
                break;
        }

        callback(returnValue);

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
    var weather = this.data;
    $("#description").html(weather.value);
    $("#temperature").html(weather.temp_C || weather.tempC);
    $("#windSpeed").html(weather.windspeedMiles);
    $("#weatherCode").html(weather.weatherCode);
    $("#sunset").html(weather.sunset);


};

// functions to run in the dom

$(document).ready(function () {
    getWeather("leeds", "3", "today");
    $('#DayInTwoDays').html(dayInTwoDays());
});

// events
$(".weather-toggle").click(function(){
    getWeather("leeds", "3", $(this).val());

    // call the function for the val
});

function getWeather(city, days, day) {
    var apiCall, options;
    options = {
        q: city,
        days: days,
        reportFor: day
    };
    apiCall = new WeatherApiCall(options);
    apiCall.call(function (result) {
        apiCall.data = result;
        apiCall.setHtml();
    });
};

function dayInTwoDays() {
    return moment().add(2, "days").format("dddd");
}

