
$(document).ready(function() 
{
    // Fetch and handle iCal data
    const propertyname = 'Modern Coral Villa';
    const propertyid = 758340;

    $.get('/moderncoralvilla-calendar-parsed', function(totaldisabledDates) 
    {
        //console.log('Disabled Dates Received:', totaldisabledDates);
        totaldisabledDates.sort((a, b) => new Date(a) - new Date(b));

        // Function to find the next disabled date after the selected start date
        function findNextDisabledDate(startDate) 
        {
            var disabledDates = totaldisabledDates;
        
            for (var i = 0; i < disabledDates.length; i++)
            {
                var disabledDate = new Date(disabledDates[i]);
                if (disabledDate > startDate) 
                {
                return disabledDate;
                }
            }

            return new Date(9999, 0, 1); // A very distant future date if no disabled date is found
        }
    

        // Enable/Disable submit button based on selected dates and number of guests
        $('#date, #guests').change(function() 
        {
            var startDate = $('#date').datepicker('getStartDate');
            var endDate = $('#date').datepicker('getEndDate');
            var numGuests = $('#guests').val();

            if (startDate && endDate && numGuests) 
            {
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
            datesDisabled: totaldisabledDates,
            orientation: "bottom auto",
            clearBtn: true,
            beforeShowDay: function (date) 
            {
                var currentDate = new Date(date);
                var selectedDates = $('#date').datepicker('getDates');
                var startDate = selectedDates[0];
                var endDate = selectedDates[1];

                // Check if current date is before the selected start date
                if (startDate && currentDate < startDate) 
                {
                    return {
                        enabled: false
                    };
                }

                // Check if start date is selected
                if (startDate)
                {
                    // Find the next disabled date after the selected start date
                    var nextDisabledDate = findNextDisabledDate(startDate);

                    // Highlight the selected range
                    if (endDate && currentDate >= startDate && currentDate <= endDate) 
                    {
                        return {
                            enabled: true,
                            classes: 'highlighted'
                               };
                    }

                    // Disable all dates after the next disabled date
                    if (currentDate > nextDisabledDate)
                    {
                        return {
                            enabled: false
                               };
                    }
                }

                return {
                    enabled: true
                };
            },
            }).on("changeDate", function(event)
            {
          
                var dates = event.dates,
                elem = $('#date');
                if (elem.data("selecteddates") == dates.join(",")) return;
                if (dates.length > 2) dates = dates.splice(dates.length - 1);
                dates.sort(function(a, b) { return new Date(a).getTime() - new Date(b).getTime() });
                elem.data("selecteddates", dates.join(",")).datepicker('setDates', dates);

                console.log("Selected Dates:", dates);

                // Check if both start and end dates are selected
                if (dates.length === 2)
                {
                    var startDate = new Date(dates[0]);
                    var endDate = new Date(dates[1]);
                    var selectedDates = [];
        
                    // Fill the dates between start and end dates
                    var currentDate = startDate;
                    while (currentDate <= endDate)
                    {
                    selectedDates.push(new Date(currentDate));
                    currentDate.setDate(currentDate.getDate() + 1);
                    }
        
                    console.log("All Selected Dates:", selectedDates);
                
                    // Hide the date picker
                    $('#date').datepicker('hide');
                }
            });
        });

        $('#submitBtn').on('click', function() 
        {
            $('#resultContainer').html(`
            <h2>LOADING...</h2>
            `);
            var selectedDates = $('#date').datepicker('getDates');
            var startDate = selectedDates[0];
            var endDate = selectedDates[selectedDates.length - 1];
            var numGuests = $('#guests').val();

            // Check if startDate and endDate are valid date objects
            if (startDate instanceof Date && !isNaN(startDate) && endDate instanceof Date && !isNaN(endDate)) 
            {
                updatePrice(startDate, endDate, numGuests, propertyid)
                    .then(function(pricePerNight) {
                //console.log('Price per day:', pricePerNight);
                // Calculate total nights

                // Remove $ sign and convert to a number
                pricePerNight = parseFloat(pricePerNight.replace('$', ''));

                var totalNights = Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24));
                //const pricePerNight = updatePrice(startDate, endDate);
                const subtotal = (totalNights * pricePerNight).toFixed(2);
                const cleaning = 400.00;
                const deposit = 1000.00;
                var total = (parseFloat(subtotal) + cleaning + deposit).toFixed(2);
            
     
                // Update result container with selected information
                $('#resultContainer').html(`
                    <h2>${propertyname}</h2>
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
                // Attach event listener for "Back" button after it is created
                $('#backBtn').on('click', function()
                {
                    // Enable the "Request to Book" button
                    $('#requestBtn').prop('disabled', false);

                
                    // Assuming that the appended content is the last child of #resultContainer
                    $('#resultContainer').children().last().remove();

                    // Enable the "Request to Book" button
                    $('#requestBtn').prop('disabled', false);

                    // Remove the appended content
                    $('#resultContainer').empty();

                    // Hide resultContainer and show date selection container
                    $('#dateContainer').show();
                    $('#resultContainer').hide();
                });

                // Attach event listener for "Request to book" button (outside the result container creation block)
                $('#requestBtn').on('click', function() 
                {
                    // Disable the button
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
                // Attach event listener for the "Send Booking Request" button
                $('#sendRequestBtn').on('click', function() 
                {
                    // Handle the booking request logic here
                    // Collect guest details
                    const firstName = $('#firstName').val();
                    const lastName = $('#lastName').val();
                    const email = $('#email').val();
                    const phone = $('#phone').val();
                    const customMessage = $('#customMessage').val();
  
                    // Collect booking details
                    const bookingDetails = {
                    propertyname: propertyname,
                    startDate: startDate, 
                    endDate: endDate,     
                    totalNights: totalNights, 
                    numGuests: numGuests,
                    pricePerNight: pricePerNight,
                    subtotal: subtotal,
                    cleaningFee: cleaning,
                    deposit: deposit,
                    total: total
                                        };
  
                    // Create an object with both guest and booking details
                    const requestData = {
                    guestDetails: {
                    firstName,
                    lastName,
                    email,
                    phone,
                    customMessage,
                                  },
                    bookingDetails,
                    };
  
                    // Send an AJAX request to your server with the data
                    $.ajax({
                        type: 'POST',
                        url: '/send-booking-request',
                        data: requestData,
                        success: function(response) 
                        {
                        // Handle success (if needed)
                        console.log(response);
                        // Assuming you want to remove the form after sending the request
                        $('#resultContainer').empty();
                        },
                        error: function(error) 
                        {
                        // Handle error (if needed)
                        console.error(error);
                        }
                    });
                });

                // Attach event listener to enable/disable "Send Booking Request" button
                $('#guestDetailsForm input, #acceptTerms').on('input change', function() 
                {
                    const firstName = $('#firstName').val();
                    const lastName = $('#lastName').val();
                    const email = $('#email').val();
                    const acceptTerms = $('#acceptTerms').is(':checked');
                    const isFormValid = firstName && lastName && email && acceptTerms;
                    $('#sendRequestBtn').prop('disabled', !isFormValid);
                });
            });
        })
        .catch(function(error) {
            console.error(error);
        });
            // Hide the selection container and show the result container
            $('#dateContainer').hide();
            $('#resultContainer').show();
            } else {
            // Handle case when dates are not selected
            // You can show an error message or handle it as per your requirements
            console.log('Invalid Dates or Guests');
            }
        });
   
        function updatePrice(startDate, endDate, numGuests, propertyid) 
        {
            // Return a promise to handle the asynchronous nature of AJAX
            return new Promise(function(resolve, reject) 
            {
                // Make an AJAX request to your server with the selected dates
                $.ajax({
                    url: '/get-vrbo-price',
                    method: 'POST',
                    data: 
                    {
                    startDate: startDate.toISOString(), // Convert dates to ISO format
                    endDate: endDate.toISOString(),
                    numGuests: numGuests,
                    propertyid: propertyid
                    },
                    success: function (response) 
                    {
                    // Resolve the promise with the fetched price
                    resolve(response.price);
                    },
                    error: function () 
                    {
                    // Reject the promise in case of an error
                    reject('Error fetching VRBO price');
                    }
                });
            });
        }    




});

