function constructVrboUrl(startDate, endDate, numGuests, propertyid) {
    const propertyId = propertyid; //  VRBO property ID
    const adults = numGuests; // number of adults
    const startDateString = formatDate(startDate); // Format dates as needed
    const endDateString = formatDate(endDate);

    const vrboBaseUrl = 'https://www.vrbo.com/' + propertyId;
    const queryParams = [
        'adults=' + adults,
        'chkin=' + startDateString,
        'chkout=' + endDateString,
        // Add any other parameters as needed
    ];

    return vrboBaseUrl + '?' + queryParams.join('&');
}

// Helper function to format dates as 'MM/DD/YYYY'
function formatDate(date) {
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
}
module.exports = {
    constructVrboUrl
};