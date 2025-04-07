
$(document).ready(function () {
    function loadLanguage(lang) {
        $.getJSON(`../static/lang/${lang}.json`, function (data) {
            $("[data-i18n]").each(function () {
                let key = $(this).attr("data-i18n");

                // Handle placeholders separately
                if ($(this).is("input, textarea")) {
                    let attr = $(this).attr("data-i18n").split("[")[1].split("]")[0]; 
                    $(this).attr(attr, data[key]);
                } else {
                    $(this).html(data[key]); // Set inner text for other elements
                }
            });
        });
    }

    // Load saved language or default to English
    let savedLang = localStorage.getItem("language") || "en";
    loadLanguage(savedLang);

    // Language change event
    $(".lang-btn").on("click", function () {
        let selectedLang = $(this).attr("data-lang");
        localStorage.setItem("language", selectedLang); // Save selected language
        loadLanguage(selectedLang);
    });
});


$(document).ready(function () {
    
    // Get CSRF token for Django
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    const csrftoken = getCookie('csrftoken');

    $('#register').on('click', function (e) {
        e.preventDefault();

        // Get form values
        const username = $("#username").val().trim();
        const email = $("#email").val().trim();
        const password = $("#password").val();
        const confirm_password = $("#confirm_password").val();


        $.ajax({
            url: 'https://5601-95-46-70-152.ngrok-free.app/api/register/',
            type: 'POST',
            contentType: 'application/json',
            headers: {
                'X-CSRFToken': csrftoken
            },
            data: JSON.stringify({
                username: username,
                email: email,
                password: password,
                confirm_password: confirm_password
            }),
            success: function (response) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Registration completed successfully.',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                }).then(() => {
                    window.location.href = './index.html';
                });
            },
            error: function (xhr) {
                let errorMsg = "An unknown error occurred!";
                
                try {
                    if (xhr.responseJSON) {
                        errorMsg = "";
                        const errors = xhr.responseJSON;
                        Object.keys(errors).forEach(function (key) {
                            if (Array.isArray(errors[key])) {
                                errorMsg += errors[key].join("<br>") + "<br>";
                            } else {
                                errorMsg += errors[key] + "<br>";
                            }
                        });
                    } else if (xhr.responseText) {
                        errorMsg = xhr.responseText;
                    }
                } catch (e) {
                    console.error("Error parsing error response:", e);
                }

                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    html: errorMsg,
                    confirmButtonColor: "#d33",
                });
            }
        });
    });

    // Password toggle functionality
    $("#togglePassword").on("click", function() {
        const passwordField = $("#password");
        const icon = $(this);
        if (passwordField.attr("type") === "password") {
            passwordField.attr("type", "text");
            icon.removeClass("fa-eye-slash").addClass("fa-eye");
        } else {
            passwordField.attr("type", "password");
            icon.removeClass("fa-eye").addClass("fa-eye-slash");
        }
    });

    $("#toggleConfirmPassword").on("click", function() {
        const confirmPasswordField = $("#confirm_password");
        const icon = $(this);
        if (confirmPasswordField.attr("type") === "password") {
            confirmPasswordField.attr("type", "text");
            icon.removeClass("fa-eye-slash").addClass("fa-eye");
        } else {
            confirmPasswordField.attr("type", "password");
            icon.removeClass("fa-eye").addClass("fa-eye-slash");
        }
    });

    // Clear icon functionality
    $(".clear-icon").on("click", function() {
        $(this).prev("input").val("").focus();
    });
});