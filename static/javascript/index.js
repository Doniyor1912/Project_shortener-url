$(document).ready(function () {
    function changeLanguage(lang) {
        $.getJSON(`./locales/${lang}.json`, function (translations) {
            $("[data-i18n]").each(function () {
                let key = $(this).attr("data-i18n");

                // Check if it's an input field (update placeholder)
                if ($(this).is("input, textarea")) {
                    $(this).attr("placeholder", translations[key]);
                } else {
                    $(this).text(translations[key]);
                }
            });
        });
    }

    // Detect user's preferred language
    let userLang = localStorage.getItem("lang") || "en";
    $("#languageSwitcher").val(userLang);
    changeLanguage(userLang);

    // Change language on dropdown select
    $("#languageSwitcher").on("change", function () {
        let selectedLang = $(this).val();
        localStorage.setItem("lang", selectedLang);
        changeLanguage(selectedLang);
    });
});






$(document).ready(function () {
    // Register
    $('#register').click(function() {
        window.location.href = "./register.html";
    }),



    $('#share_lnk').on('click', function () {
        $('.visible_link').slideToggle('fast'); // Add sliding animation
    });



    // Login
    $("#login").click(function () {
        $.confirm({
            title: 'Login!',
            backgroundDismiss: true,
            content: `
                <div class="container-fluid">
                    <div class="row">
                        <div class="col-12">
                            <form id="loginForm" class="login-modal">
                                <div class="form-group">
                                    <label class="form-label">Username</label>
                                    <input type="text" class="form-control" id="username" placeholder="Enter username">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Password</label>
                                    <input type="password" class="form-control" id="password" placeholder="Enter password">
                                </div>
                                <div class="form-check">
                                    <a href="#" class="forgot-password">Forgot password?</a>
                                </div>
                            </form>
                            <div class="sign-up">
                                <p class="p-confirm mb-0">Don't have an account? <a href="register.html" class="text-primary">Sign up now</a></p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            useBootstrap: false,
            
            onOpenBefore: function () {
                // z-index
                this.$el.css("z-index", "1050"); 
                // title-color change
                this.$title.css("color", "white");

                // Change input style on focus
                $(".form-control").on("focus", function () {
                    $(this).css({
                        'color': "#444",
                        "background": "#fff", 
                    });
                });

                // Reset style on blur
                $(".form-control").on("blur", function () {
                    $(this).css({
                        'color':'#fff',
                        "background": "#444",   
                    });
                });

                $('p').addClass('form-label')
                $('.text-primary').css('text-decoration',"none")
            },
            buttons: {
                login: {
                    text: "Log In",
                    btnClass: "btn-primary",
                    action: function () {
                        let username = $("#username").val();
                        let password = $("#password").val();

                        // 🔹 Bo‘sh maydonlar uchun validatsiya
                        if (!username || !password) {
                            Swal.fire({
                                icon: "warning",
                                title: 'Warning!',
                                text: "Please enter your username and password!",
                                confirmButtonColor: "#ffc107",
                                confirmButtonText: "OK"
                            });
                            return;
                        }

                        Swal.fire({
                        title: "⏳ Iltimos, kuting...",
                        text: "Login amalga oshirilmoqda",
                        allowOutsideClick: false,
                        didOpen: () => Swal.showLoading(),
                        timer: 2000
                        });

                        $.ajax({
                            url: "http://127.0.0.1:8000/api/login/",
                            type: "POST",
                            contentType: "application/json",
                            data: JSON.stringify({  username: username, password: password }),
                            success: function (response) {
                                if (response.auth_token) {
                                    localStorage.setItem("token", response.auth_token);
                                    localStorage.setItem("username", username);
                                }

                                $(".jconfirm").fadeOut(200, function () {
                                    $(this).remove();
                                });

                                if (response.status === true || response.success) {
                                    // Swal.fire({
                                    //     title: 'Success!',
                                    //     text: 'Login successful',
                                    //     icon: 'success',
                                    //     didOpen: () => {
                                    //         $(".swal2-container").css("z-index", "9999"); 
                                    //     }
                                    // }).then(() => {
                                    window.location.href = './main.html';
                                    // });
                                } else {
                                    Swal.fire({
                                        title: 'Error!',
                                        text: response.message || "Unexpected response",
                                        icon: 'error'
                                    });
                                }
                            },
                            error: function(xhr) {
                                let errorMessage = "Something went wrong!";
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
                            },
                        });

                        return false; // Prevents modal from closing automatically
                    },
                },
                cancel: {
                    text: "Cancel",
                    action: function () {
                        // Do nothing, just close
                    },
                },
            },
            
        });
    });


    $(document).ready(function() {
        $(".lang-option").click(function() {
            var selectedLang = $(this).data("lang");
            
            // Change button text and flag
            var selectedText = $(this).text();
            var selectedFlag = $(this).find("img").attr("src");
            $("#languageDropdown").html(`<img id="selectedFlag" src="${selectedFlag}" width="20"> ${selectedText}`);

            // Redirect to selected language URL
            var currentUrl = window.location.href;
            var newUrl = currentUrl.replace(/\/(uz|ru|en)\//, "/" + selectedLang + "/");
            window.location.href = newUrl;
        });
    });

});




        $(document).ready(function () {
            // Hide the container by default
            $('.container_short').hide();
        
            $('#submit_btn').on('click', function () {
                const originUrl = $('#input_url').val();


                if (!originUrl) {
                    alert("Please enter a URL!");
                    return;
                }
        
                $.ajax({
                    url: 'http://127.0.0.1:8000/api/2/shorten-url/',
                    type: 'POST',
                    contentType: 'application/json',
                    data: JSON.stringify({ origin_url: originUrl }),
                    success: function (response) {
                        // Update the short link text
                        $('#short_lnk').text(response.short_url);
                        // $('#short_lnk').attr('href', response.short_url);

                        $("#input_url").val("");
        
                        // Show the container with the short URL
                        $('.container_short').show();
        
                        // Optionally, scroll to the container for better UX
                        $('html, body').animate({
                            scrollTop: $('.container_short').offset().top
                        }, 500);
                    },
                    error: function () {
                        
                    }
                });
            });
        });
        //##########################--------COPY-BUTTON-----------################################### 
        $(document).ready(function() {
            // Handle Copy Button Click
            $('.copy_link_short').click(function() {
                const text = $('#short_lnk').text(); // Get the text from the target element
        
                // Copy to Clipboard
                navigator.clipboard.writeText(text).then(() => {
                    showToast("Copied to clipboard: " + text); 
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                    showToast("Failed to copy!"); 
                });
            });
        
            // Function to show a toast notification
            function showToast(message) {
                const toast = document.createElement("div");
                toast.textContent = message;
                toast.style.position = "fixed";
                toast.style.bottom = "20px";
                toast.style.right = "20px";
                toast.style.backgroundColor = "#333";
                toast.style.color = "#fff";
                toast.style.padding = "10px 20px";
                toast.style.borderRadius = "5px";
                toast.style.zIndex = "1000";
                toast.style.opacity = "0";
                toast.style.transition = "opacity 0.5s";
        
                document.body.appendChild(toast);
        
                // Fade in the toast
                setTimeout(() => {
                    toast.style.opacity = "1";
                }, 10);
        
                // Fade out and remove the toast after 3 seconds
                setTimeout(() => {
                    toast.style.opacity = "0";
                    setTimeout(() => {
                        document.body.removeChild(toast);
                    }, 500); 
                }, 3000);
            }
        });
        








//         $(document).ready(function () {
//             $('#shortenButton').on('click', function () {
//                 const originUrl = $('#originUrlInput').val();
        
//                 $.ajax({
//                     url: 'http://127.0.0.1:8000/api/shorten-url/',
//                     type: 'POST',
//                     contentType: 'application/json',
//                     data: JSON.stringify({ origin_url: originUrl }),
//                     success: function (response) {
//                         $('#shortUrlDisplay').html(`
//                             <a href="${response.short_url}" target="_blank">${response.short_url}</a>
//                         `);
//                     },
//                     error: function () {
//                         alert('Failed to shorten URL');
//                     }
//                 });
//             });
//         });
        
        
//       // Input_url
//         $("#submit_btn").click(function () {
//         let originalUrl = $("#input_url").val().trim(); 

//         if (originalUrl === "") {
//             Swal.fire("Error", "Please enter a URL!", "error");
//             return;
//         };

//         $.ajax({
//             url: "http://127.0.0.1:8000/api/shorten-url/", 
//             type: "POST",
//             contentType: "application/json",
//             data: JSON.stringify({ origin_url: originalUrl }),
//             success: function (response) {
//                 Swal.fire("Success", "URL successfully shortened!", "success");

//                 $("#input_url").val("");

//                 table.ajax.reload();
//             },
//             error: function (xhr) {
//                 Swal.fire("Error", "Failed to shorten URL: " + xhr.responseText, "error");
//             }
//         });
//     });




