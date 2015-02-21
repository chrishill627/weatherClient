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
        console.log(data);
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
                _.pick(weather.weather[0].astronomy[0], "sunset"),
                // get tomorrows sunrise to show if the sun has set
                _.pick(weather.weather[1].astronomy[0], "sunrise")
            );
        };

        function getForcast(arrayIndex) {
            return _.extend(
                // find the sunset time
                _.pick(weather.weather[arrayIndex].astronomy[0], "sunset", "sunrise"),
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
    $("#sunset").html(astromonyDetails(weather));

    function astromonyDetails(weather) {

        var sunsetTime, removePeriod, addTwelveHours, splitTime, parseMins, date, minutes, hour, seconds;
        sunsetTime = weather.sunset;
        removePeriod = sunsetTime.split(" ")[0];
        splitTime = removePeriod.split(":");
        addTwelveHours = ( parseInt(splitTime[0]) + 12 );
        parseMins = parseInt(splitTime[1]);
        //console.log(addTwelveHours);
        date = new Date;
        hour = date.getHours();
        minutes = date.getMinutes();

        // if the sun is setting later return sunsets at
        if (addTwelveHours > hour) {
            if (addTwelveHours === hour && parseMins > minutes) {
                return "tomorrow sunrise is at "+weather.sunrise;
            } else {
                return "Sunsets at "+weather.sunset;
            }
        } else {
            return "tomorrow sunrise is at "+weather.sunrise;
        }
        // or return tomorrows sunrise




        return sunsetTime;
    }


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

