$(document).ready(function () {

    $('#registration').on('click', function () {

        $.ajax({
            url: 'http://127.0.0.1:8000/api/register/',
            type: 'POST',
            data: {
                username: $('#username').val(),
                email: $('#email').val(),
                // first_name: $('#first_name').val(),
                // last_name: $('#last_name').val(),
                password: $('#password').val(),
                confirm_password: $('#confirm_password').val()
            },

            success: function (response) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Registration successful',
                    icon: 'success', 
                    showConfirmButton: false,
                    timer: 1500
                }).then(() => {
                    window.location.href = './index.html';
                });
                

            },
            error: function(xhr) {
                let errorMessage = "";
                if (xhr.responseJSON) {
                    if (xhr.responseJSON.detail) {
                        // Case 1: Standard Django error (Authentication, Permission errors)
                        errorMessage = xhr.responseJSON.detail;
                    } else if (xhr.responseJSON.error) {
                        // Case 2: Custom error responses with "error" key
                        errorMessage = xhr.responseJSON.error;
                    } else if (xhr.responseJSON.non_field_errors) {
                        // Case 3: Django DRF validation errors (e.g., incorrect credentials)
                        errorMessage = xhr.responseJSON.non_field_errors.join(", ");
                    } 
                } 
                else if (xhr.responseText) {
                    // Case 5: Handle plain text responses (non-JSON errors)
                    errorMessage = xhr.responseText;
                };


                Swal.fire({
                    title: 'Error!',
                    text: errorMessage,
                    icon: 'error'
                });
            }
        });
        
    });



});
