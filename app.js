var currDate;
var currDateTime;

var userLocation = function () {
    var deffered = $.Deferred();
    var url = 'https://api.darksky.net/forecast/ae54b894282da499d6036075dca8d747/';
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (position) {
            var latitude = position.coords.latitude;
            var longitude = position.coords.longitude;
            localStorage.setItem('latitude', latitude);
            localStorage.setItem('longitude', longitude);
            url += latitude + ',' + longitude;
            deffered.resolve(url);
        }, handleError);
        return deffered.promise();
    } else {
        // container.innerHTML = "Geolocation is not Supported for this browser/OS.";
        alert("Geolocation is not Supported for this browser/OS");
    }
};

function handleError(error) {
    //Handle Errors
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    }
}

userLocation().then(function (data) {
    $.ajax({
        url: data,
        dataType: 'jsonp'
    }).done(function (data) {
        currDate = new Date();
        setLocation(data);
        setTemperature(data);
        setDateTime(data);
    }).catch(function (e) {
        console.log('eror: ' + e);
    });
});

function setLocation(data) {
    var lat = data.latitude;
    var lon = data.longitude;
    var map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: lat, lng: lon},
        scrollwheel: false,
        zoom: 17
    });
}

function setDateTime(data) {
    digitalWatch();
    setDate(data);
}

function getCurrentMonth(i) {
    monthArr = ['January', 'February', 'Mach', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return monthArr[i];
}

function setDate(data) {
    if (!currDateTime) {
        var date = new Date(data.currently.time * 1000);
        var month = date.getMonth();
    } else {
        var date = new Date(currDateTime * 1000);
        var month = date.getMonth();
    }
    var year = date.getFullYear();
    month = getCurrentMonth(month);
    var day = date.getDate();
    $('.year').text(year);
    $('.month').text(month);
    $('.day').text(day);

}

function digitalWatch() {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    if (hours < 10) hours = "0" + hours;
    if (minutes < 10) minutes = "0" + minutes;
    if (seconds < 10) seconds = "0" + seconds;
    $('#digitalWatch').text(hours + ":" + minutes + ":" + seconds);
    setTimeout("digitalWatch()", 1000);
}


function setTemperature(data) {
    if ($('#myTable > tbody > tr').length == 0) {
        createTable(data);
    }
    else {
        for (var i = 0; i < $('#myTable > tbody > tr').length; i++) {
            $('#myTable > tbody > tr').remove()
        }
        createTable(data);
    }
}

function createTable(data) {
    var temp = Math.round((data.currently.temperature - 32) * 5 / 9);
    var apparentTemp = Math.round((data.currently.apparentTemperature - 32) * 5 / 9);
    var summary = data.currently.summary;
    var arr = [temp, apparentTemp, summary];
    for (i = 0; i < arr.length; i++) {
        $('#myTable').append('<tr></tr>');
        if (i == 0) {
            $('#myTable > tbody > tr:last').append('<td> Temperature: </td>');
            $('#myTable > tbody > tr:last').append('<td> ' + arr[i] + '</td>');
        }
        else if (i == 1) {
            $('#myTable > tbody > tr:last').append('<td> Feeling like: </td>');
            $('#myTable > tbody > tr:last').append('<td> ' + arr[i] + '</td>');
        }
        else if (i == 2) {
            $('#myTable > tbody > tr:last').append('<td>Summary: </td>');
            $('#myTable > tbody > tr:last').append('<td> ' + arr[i] + '</td>');
        }
    }
}

$('#previus').click(function () {
    var previusDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() - 1);
    var previusDayTime = previusDay.getTime() / 1000;
    currDateTime = previusDayTime;
    currDate = new Date(currDateTime * 1000);
    $("#next").prop("disabled", false);
    $("#next").text('');
    $('#next').append('<span class="glyphicon glyphicon-chevron-right" aria-hidden="true"></span>Next day');

    userLocation().then(function (data) {
        $.ajax({
            url: data + ',' + currDateTime,
            dataType: 'jsonp'
        }).done(function (data) {
            setLocation(data);
            setTemperature(data);
            setDateTime(data);
        }).catch(function (e) {
            console.log('eror: ' + e);
        });
    });
});

$('#next').click(function () {
    var nextDay = new Date(currDate.getFullYear(), currDate.getMonth(), currDate.getDate() + 1);
    if (nextDay.getDate() > new Date().getDate()) {
        $('#next').prop('disabled', true);
        $('#next').text('You cant see weather for tomorrow!');
        return;
    } else if (nextDay.getDate() == new Date().getDate()) {
        nextDay = new Date();
        var nextDayTime = nextDay.getTime() / 1000;
        currDateTime = nextDayTime;
        currDate = new Date(currDateTime * 1000);

        userLocation().then(function (data) {
            $.ajax({
                url: 'https://api.darksky.net/forecast/789049a8218d7cb5b911b8e7252f7703/' + localStorage.getItem('latitude') + ',' + localStorage.getItem('longitude'),
                dataType: 'jsonp'
            }).done(function (data) {
                setLocation(data);
                setTemperature(data);
                setDateTime(data);
            }).catch(function (e) {
                console.log('eror: ' + e);
            });
        });
    } else {
        var nextDayTime = nextDay.getTime() / 1000;
        currDateTime = nextDayTime;
        currDate = new Date(currDateTime * 1000);

        userLocation().then(function (data) {
            $.ajax({
                    url: 'https://api.darksky.net/forecast/789049a8218d7cb5b911b8e7252f7703/' + localStorage.getItem('latitude') + ',' + localStorage.getItem('longitude') + currDateTime,
                dataType: 'jsonp'
        }).
            done(function (data) {
                setLocation(data);
                setTemperature(data);
                setDateTime(data);
            }).catch(function (e) {
                console.log('eror: ' + e);
            });
        });
    }
});