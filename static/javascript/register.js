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

                // let errorMessage = "An unexpected error occurred.";
                // if (xhr.responseJSON) {
                //     if (xhr.responseJSON.username) {
                //         errorMessage = xhr.responseJSON.username[0];
                //     }else if (xhr.responseJSON.error) {
                //         errorMessage = xhr.responseJSON.error;
                //     }
                // }
                // else if (xhr.responseJSON && xhr.responseJSON.error) {
                //     errorMessage = xhr.responseJSON.error;
                // } else if (xhr.responseText) {
                //     errorMessage = xhr.responseText;
                // }

                Swal.fire({
                    title: 'Error!',
                    text: xhr.responseText,
                    icon: 'error'
                });}
        });
        
    });



});
