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
            error: function (xhr) {
                let errorMsg = "";
                let errors = xhr.responseJSON; // Extract JSON error response
        
                if (errors) {
                    Object.keys(errors).forEach(function (key) {
                        errorMsg += errors[key].join("<br>") + "<br>"; // Format error messages
                    });
                } else {
                    errorMsg = "An unknown error occurred!";
                }
        
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    html: errorMsg,  // Use 'html' instead of 'text' to allow line breaks
                    confirmButtonColor: "#d33",
                });
            }
        });
        
    });



});
