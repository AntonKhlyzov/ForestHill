$(document).ready(function() {
    // Fetch and handle iCal data
    const propertyName = 'Modern Coral Villa';
    const propertyId = 758340;

    $.get('/moderncoralvilla-calendar-parsed', function(totalDisabledDates) {
        // Convert all disabled dates to UTC Date objects
        totalDisabledDates = totalDisabledDates.map(parseDate);
       // console.log("All disabled Dates:", totalDisabledDates);
        // Function to parse date strings into Date objects in UTC
        function parseDate(dateString) {
            const [month, day, year] = dateString.split('/');
            return new Date(Date.UTC(year, month - 1, day));
        }

        // Function to find the next disabled date after the selected start date
        function findNextDisabledDate(startDate) {
            const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate()));

            for (let i = 0; i < totalDisabledDates.length; i++) {
                const disabledDate = totalDisabledDates[i];
                if (disabledDate > start) {
                    return disabledDate;
                }
            }

            return new Date(Date.UTC(9999, 0, 1)); // A very distant future date if no disabled date is found
        }

        // Enable/Disable submit button based on selected dates and number of guests
        $('#date, #guests').change(function() {
            const startDate = $('#date').datepicker('getStartDate');
            const endDate = $('#date').datepicker('getEndDate');
            const numGuests = $('#guests').val();

            if (startDate && endDate && numGuests) {
                $('#submitBtn').prop('disabled', false);
            } else {
                $('#submitBtn').prop('disabled', true);
            }
        });

        // Initialize date pickers with disabled dates
        $('#date').datepicker({
            startView: 0,
            minViewMode: 0,
            maxViewMode: 2,
            multidate: true,
            multidateSeparator: " to ",
            startDate: new Date(),
            todayHighlight: true,
            datesDisabled: totalDisabledDates,
            orientation: "bottom auto",
            clearBtn: true,
            beforeShowDay: function(date) {
                const currentDate = new Date(date);
                const selectedDates = $('#date').datepicker('getDates');
                const startDate = selectedDates[0];
                const endDate = selectedDates[1];

                if (startDate && currentDate < startDate) {
                    return { enabled: false };
                }

                if (startDate) {
                    const nextDisabledDate = findNextDisabledDate(startDate);

                    if (endDate && currentDate >= startDate && currentDate <= endDate) {
                        return { enabled: true, classes: 'highlighted' };
                    }

                    if (currentDate > nextDisabledDate) {
                        return { enabled: false };
                    }
                }

                return { enabled: true };
            }
        }).on("changeDate", function(event) {
            let dates = event.dates;
            const elem = $('#date');
            if (elem.data("selecteddates") == dates.join(",")) return;
            if (dates.length > 2) dates = dates.splice(dates.length - 1);
            dates.sort((a, b) => a - b);
            elem.data("selecteddates", dates.join(",")).datepicker('setDates', dates);

            console.log("Selected Dates:", dates);

            if (dates.length === 2) {
                const startDate = new Date(dates[0]);
                const endDate = new Date(dates[1]);
                let selectedDates = [];
                let currentDate = startDate;

                while (currentDate <= endDate) {
                    selectedDates.push(new Date(currentDate));
                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                }

                console.log("All Selected Dates:", selectedDates);
                $('#date').datepicker('hide');
            }
        });

        $('#submitBtn').on('click', function() {
            $('#resultContainer').html(`<h2>LOADING...</h2>`);
            const selectedDates = $('#date').datepicker('getDates');
            const startDate = selectedDates[0];
            const endDate = selectedDates[selectedDates.length - 1];
            const numGuests = $('#guests').val();

            if (startDate instanceof Date && !isNaN(startDate) && endDate instanceof Date && !isNaN(endDate)) {
                updatePrice(startDate, endDate, numGuests, propertyId)
                    .then(function(pricePerNight) {
                        pricePerNight = parseFloat(pricePerNight.replace('$', ''));
                        const totalNights = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
                        const subtotal = (totalNights * pricePerNight).toFixed(2);
                        const cleaning = 400.00;
                        const deposit = 1000.00;
                        const total = (parseFloat(subtotal) + cleaning + deposit).toFixed(2);

                        $('#resultContainer').html(`
                            <h2>${propertyName}</h2>
                            <div class="row mt-4">
                                <div class="col"><strong>Check In</strong>: ${startDate.toLocaleDateString()}</div>
                                <div class="col"><strong>Check Out</strong>: ${endDate.toLocaleDateString()}</div>
                                <div class="col"><strong>Nights</strong>: ${totalNights}</div>
                                <div class="col"><strong>Guests</strong>: ${numGuests}</div>
                            </div>
                            <hr class="my-4">
                            <div class="row mt-2">
                                <div class="col"><strong>Price per night</strong>: $${pricePerNight.toFixed(2)}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col"><strong>Subtotal</strong>: $${subtotal}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col"><strong>Cleaning fee</strong>: $${cleaning.toFixed(2)}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col"><strong>*Damage deposit</strong>: $${deposit.toFixed(2)}</div>
                            </div>
                            <hr class="my-4">
                            <div class="row mt-2">
                                <div class="col" style="font-size: 20px;"><strong>Total</strong>: $${total}</div>
                            </div>
                            <div class="row mt-2">
                                <div class="col"><strong>*Damage deposit will be returned upon check out if no damages found</strong></div>
                            </div>
                            <div class="row mt-3">
                                <div class="col text-center">
                                    <button id="backBtn" class="btn btn-secondary">Back</button>
                                    <button id="requestBtn" class="btn btn-primary">Request to Book</button>
                                </div>
                            </div>
                        `);

                        $('#backBtn').on('click', function() {
                            $('#resultContainer').empty();
                            $('#dateContainer').show();
                            $('#resultContainer').hide();
                        });

                        $('#requestBtn').on('click', function() {
                            $(this).prop('disabled', true);
                            $('#resultContainer').append(`
                                <div class="row mt-3">
                                    <div class="col">
                                        <h3>Guest Details</h3>
                                        <form id="guestDetailsForm">
                                            <div class="mb-3">
                                                <label for="firstName" class="form-label">First Name</label>
                                                <input type="text" class="form-control" id="firstName" placeholder="Guest first name (required)" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="lastName" class="form-label">Last Name</label>
                                                <input type="text" class="form-control" id="lastName" placeholder="Guest last name (required)" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="email" class="form-label">Email</label>
                                                <input type="email" class="form-control" id="email" placeholder="Enter email (required)" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="phone" class="form-label">Phone Number</label>
                                                <input type="tel" class="form-control" id="phone" placeholder="Enter phone number" required>
                                            </div>
                                            <div class="mb-3">
                                                <label for="customMessage" class="form-label">Add a special request</label>
                                                <textarea class="form-control" id="customMessage" placeholder="Enter your custom message" rows="4"></textarea>
                                            </div>
                                            <div class="form-check mb-3">
                                                <input type="checkbox" class="form-check-input" id="acceptTerms" required>
                                                <label class="form-check-label" for="acceptTerms">
                                                    I have read and accept the
                                                    <a href="/privacy" target="_blank">privacy policy</a>
                                                    and
                                                    <a href="/terms" target="_blank">terms and conditions</a> (required)
                                                </label>
                                            </div>
                                            <div class="row mt-3">
                                                <div class="col text-center">
                                                    <button id="sendRequestBtn" class="btn btn-primary" disabled>Send Booking Request</button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            `);

                            $('#acceptTerms').on('change', function() {
                                $('#sendRequestBtn').prop('disabled', !this.checked);
                            });

                            $('#sendRequestBtn').on('click', function() {
                                const requestData = {
                                    property: propertyId,
                                    startDate: startDate.toISOString(),
                                    endDate: endDate.toISOString(),
                                    guests: numGuests,
                                    firstName: $('#firstName').val(),
                                    lastName: $('#lastName').val(),
                                    email: $('#email').val(),
                                    phone: $('#phone').val(),
                                    message: $('#customMessage').val()
                                };

                                $.post('/request-booking', requestData, function(response) {
                                    alert('Booking request sent successfully!');
                                }).fail(function() {
                                    alert('Failed to send booking request.');
                                });
                            });
                        });
                    })
                    .catch(function(error) {
                        console.error('Error:', error);
                        $('#resultContainer').html('<p class="text-danger">Failed to calculate price. Please try again.</p>');
                    });
            } else {
                $('#resultContainer').html('<p class="text-danger">Invalid date selection. Please try again.</p>');
            }
        });

        async function updatePrice(startDate, endDate, numGuests, propertyId) {
            const response = await fetch(`/get-price?property=${propertyId}&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&guests=${numGuests}`);
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.text();
        }
    }).fail(function() {
        console.error('Failed to fetch calendar data.');
    });
});
