var jsWeekDays = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];
var orderedWeekDays = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
var today = new Date();
var todaysWeekDayIndex = today.getDay();
var todaysWeekDay = jsWeekDays[todaysWeekDayIndex];

function renderLocationStatus({ locationName, hours }) {
    var openingSoonStatus = document.querySelectorAll(`.status.opening-soon[data-location='${locationName}']`);
    var closingSoonStatus = document.querySelectorAll(`.status.closing-soon[data-location='${locationName}']`);
    var openStatus = document.querySelectorAll(`.status.open[data-location='${locationName}']`);
    var closedStatus = document.querySelectorAll(`.status.closed[data-location='${locationName}']`);

    // Hide all status elements first
    [openingSoonStatus, closingSoonStatus, openStatus, closedStatus].forEach(statusElements => {
        statusElements.forEach(el => el.style.display = 'none');
    });

    var renderStatus = function (status) {
        if (status === "OPEN") {
            openStatus.forEach(el => el.style.display = "flex");
        }
        if (status === "CLOSED") {
            closedStatus.forEach(el => el.style.display = "flex");
        }
        if (status === "CLOSING_SOON") {
            closingSoonStatus.forEach(el => el.style.display = "flex");
        }
        if (status === "OPENING_SOON") {
            openingSoonStatus.forEach(el => el.style.display = "flex");
        }
    };

    var getWeekDaysWithOpeningTimes = function () {
        var weekDaysWithOpeningTimes = [];
        orderedWeekDays.forEach(function (weekDay) {
            var weekDayRegex = new RegExp(`(${weekDay})\\s([01]?[0-9]|2[0-3]):([0-5][0-9])-([01]?[0-9]|2[0-3]):([0-5][0-9])`);
            var weekDayRegexMatches = hours.match(weekDayRegex);
            var hoursCanBeParsed = weekDayRegexMatches?.length && weekDayRegexMatches.length > 5;

            if (hoursCanBeParsed) {
                var openingTime = {
                    hour: weekDayRegexMatches[2],
                    min: weekDayRegexMatches[3],
                };
                var closingTime = {
                    hour: weekDayRegexMatches[4],
                    min: weekDayRegexMatches[5],
                };
                var currentWeekDayIndex = jsWeekDays.findIndex(jsWeekDay => jsWeekDay === weekDay);
                var currentWeekDay = jsWeekDays[currentWeekDayIndex];
                var diffInDays = currentWeekDayIndex - todaysWeekDayIndex;

                if (todaysWeekDay === "Saturday" && currentWeekDay === "Sunday") {
                    diffInDays = 1;
                }
                if (todaysWeekDay === "Sunday") {
                    diffInDays = currentWeekDayIndex - 7;
                    if (currentWeekDay === "Monday") {
                        diffInDays = 1;
                    }
                    if (currentWeekDay === "Sunday") {
                        diffInDays = 0;
                    }
                }

                var weekDayAsDate = new Date();
                weekDayAsDate.setDate(weekDayAsDate.getDate() + diffInDays);
                var openingTimeAsDate = new Date(weekDayAsDate.getTime());
                openingTimeAsDate.setHours(parseInt(openingTime.hour), parseInt(openingTime.min), 0, 0);
                var closingTimeAsDate = new Date(weekDayAsDate.getTime());
                closingTimeAsDate.setHours(parseInt(closingTime.hour), parseInt(closingTime.min), 0, 0);

                var closingTimeMightBeTomorrow = openingTimeAsDate > closingTimeAsDate;
                if (closingTimeMightBeTomorrow) {
                    closingTimeAsDate.setDate(closingTimeAsDate.getDate() + 1);
                }

                weekDaysWithOpeningTimes.push({
                    weekDay: weekDay,
                    isOpen: true,
                    openingTime: openingTimeAsDate,
                    closingTime: closingTimeAsDate,
                });
            } else {
                weekDaysWithOpeningTimes.push({ weekDay: weekDay, isOpen: false });
            }
        });
        return weekDaysWithOpeningTimes;
    };

    var getStatus = function () {
        var weekDaysWithOpeningTimes = getWeekDaysWithOpeningTimes();
        var status = "CLOSED";
        var now = new Date();

        weekDaysWithOpeningTimes.forEach(function (weekDayWithOpeningTimes) {
            if (weekDayWithOpeningTimes.isOpen) {
                var { openingTime, closingTime } = weekDayWithOpeningTimes;
                var isOpenNow = openingTime <= now && now < closingTime;

                if (isOpenNow) {
                    var timeBeforeClose = (closingTime.getTime() - now.getTime()) / 1000;
                    timeBeforeClose /= 60;
                    var timeBeforeCloseInMin = Math.abs(Math.round(timeBeforeClose));

                    if (timeBeforeCloseInMin < 60) {
                        status = "CLOSING_SOON";
                    } else {
                        status = "OPEN";
                    }
                } else {
                    var timeBeforeOpen = (now.getTime() - openingTime.getTime()) / 1000;
                    timeBeforeOpen /= 60;
                    var timeBeforeOpenInMin = Math.abs(Math.round(timeBeforeOpen));

                    if (timeBeforeOpenInMin < 60) {
                        status = "OPENING_SOON";
                    }
                }
            }
        });
        renderStatus(status);
    };

    getStatus();
}

// Updated to work with your HTML structure
document.addEventListener('DOMContentLoaded', function() {
    // Look for .w-dyn-item instead of .list-item
    var initialLocations = document.querySelectorAll(".w-dyn-item[data-location][data-hours]");
    
    initialLocations.forEach(function (initialLocation) {
        var locationName = initialLocation.dataset.location;
        var hours = initialLocation.dataset.hours;
        
        if (locationName && hours) {
            renderLocationStatus({ locationName: locationName, hours: hours });
            console.log({ locationName: locationName, hours: hours });
        }
    });
});
