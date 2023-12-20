
const axios = require('axios');


// Implement a function to fetch iCal data (from Airbnb API or file)
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
    const disabledDates = [];

    let startDate = null;
    let endDate = null;

    lines.forEach(line => {
        if (line.startsWith('DTEND')) {
            endDate = extractDate(line);
        } else if (line.startsWith('DTSTART')) {
            startDate = extractDate(line);
            if (startDate && endDate) {
                // Adjust start and end dates by 1
                startDate.setDate(startDate.getDate() + 1);
                endDate.setDate(endDate.getDate() + 1);

                // Add all dates between startDate and endDate to disabledDates array
                let currentDate = new Date(startDate);
                while (currentDate <= endDate) {
                    disabledDates.push(formatDate(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                startDate = null;
                endDate = null;
            }
        }
    });

    //console.log('Disabled Dates:', disabledDates);
    return disabledDates;
}






function extractDate(line) {
    const match = line.match(/DT(?:START|END);VALUE=DATE:(\d{4})(\d{2})(\d{2})/);
    if (match) {
        const [, year, month, day] = match;
        return new Date(`${year}-${month}-${day}`);
    }
    return null;
}

function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
}

module.exports = {
    fetchAIRBNBICalData,
    parseAIRBNBICalData
};