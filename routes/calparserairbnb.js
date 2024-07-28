const axios = require('axios');
const { parse, format, addDays, subDays, isSameDay } = require('date-fns');

// Function to fetch iCal data (from Airbnb API or file)
async function fetchAIRBNBICalData(icalUrl) {
    try {
        const response = await axios.get(icalUrl);
        return response.data;
    } catch (error) {
        console.error('Error fetching iCal data:', error);
        throw error;
    }
}

function parseAIRBNBICalData(data) {
    const lines = data.split('\n');
    const events = [];
    const disabledDates = [];

    let startDate = null;
    let endDate = null;

    lines.forEach(line => {
        if (line.startsWith('DTEND')) {
            endDate = extractDate(line, true); // Pass a flag to adjust DTEND
        } else if (line.startsWith('DTSTART')) {
            startDate = extractDate(line);
            if (startDate && endDate) {
                events.push({ startDate, endDate });
                startDate = null;
                endDate = null;
            }
        }
    });

    // Sort events by startDate
    events.sort((a, b) => a.startDate - b.startDate);

    for (let i = 0; i < events.length; i++) {
        startDate = events[i].startDate;
        endDate = events[i].endDate;
        //console.log(`Processing AIRBNB event from ${startDate} to ${endDate}`);

        // Add all dates between startDate (exclusive) and endDate (inclusive) to disabledDates array
        let currentDate = addDays(startDate, 1); // Start from the day after startDate
        while (currentDate <= endDate) {
            //console.log('Adding disabled AIRBNB date:', formatDate(currentDate));
            disabledDates.push(currentDate);
            currentDate = addDays(currentDate, 1);
        }

        // If there is a next event and it starts the day after the current end date, disable the start date of the next event
        if (i + 1 < events.length) {
            const nextStartDate = events[i + 1].startDate;
            if (isSameDay(addDays(endDate, 1), nextStartDate)) {
                //console.log('Adding disabled AIRBNB date due to back-to-back event:', formatDate(nextStartDate));
                disabledDates.push(nextStartDate);
            }
        }
    }

    // Sort disabledDates in chronological order
    disabledDates.sort((a, b) => a - b);

    // Format dates for display
    const formattedDisabledDates = disabledDates.map(date => formatDate(date));

    return formattedDisabledDates;
}

function extractDate(line, isEndDate = false) {
    const match = line.match(/DT(?:START|END);VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
    if (match) {
        const [, year, month, day] = match;
        // Parse date using date-fns
        let date = parse(`${year}-${month}-${day}`, 'yyyy-MM-dd', new Date());
        // Subtract one day if it's DTEND to make it inclusive
        if (isEndDate) {
            date = subDays(date, 1);
        }
        return date;
    }
    return null;
}

function formatDate(date) {
    return format(date, 'MM/dd/yyyy');
}

module.exports = {
    fetchAIRBNBICalData,
    parseAIRBNBICalData
};
