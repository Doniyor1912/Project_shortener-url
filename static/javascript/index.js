$(document).ready(function() {
    const flagMap = {
        "en": { img: "https://flagcdn.com/w40/gb.png", name: "English" },
        "uz": { img: "https://flagcdn.com/w40/uz.png", name: "Uzbek" },
        "ru": { img: "https://flagcdn.com/w40/ru.png", name: "Русский" }
    };

    // Store translations globally
    let currentTranslations = {};
    let currentLanguage = localStorage.getItem("lang") || "en";

    // Function to update all translations on page
    function applyTranslations() {
        $("[data-i18n]").each(function() {
            const key = $(this).data("i18n");
            const translation = getTranslation(key);
            
            if (!translation) return;

            // Handle different element types
            if ($(this).is("input, textarea")) {
                if ($(this).attr("type") === "button" || $(this).attr("type") === "submit") {
                    $(this).val(translation);
                } else {
                    $(this).attr("placeholder", translation);
                }
            } else if ($(this).is("button")) {
                // Preserve any HTML inside buttons (like icons)
                if ($(this).children().length > 0) {
                    $(this).contents().filter(function() {
                        return this.nodeType === 3; // Text nodes only
                    }).replaceWith(translation);
                } else {
                    $(this).text(translation);
                }
            } else {
                $(this).text(translation);
            }
        });
        
        // Update dynamic content
        updateDynamicContent();
    }

    // Helper function to get nested translations
    function getTranslation(key) {
        try {
            const keys = key.split('.');
            let result = currentTranslations;
            
            for (const k of keys) {
                if (!result.hasOwnProperty(k)) {
                    console.warn(`Missing translation for key: ${key}`);
                    return null;
                }
                result = result[k];
            }
            return result;
        } catch (e) {
            console.error(`Error getting translation for ${key}:`, e);
            return null;
        }
    }

    // Update dynamic content like counts
    function updateDynamicContent() {
        // Update history count
        const count = $('#url-table-body tr').length || 0;
        const historyText = getTranslation('main.history.title')?.replace('{count}', count) || `History (${count})`;
        $('#history-count').text(historyText);
        
        // Update login modal if open
        updateModalTranslations();
    }

    // Function to update modal translations
    function updateModalTranslations() {
        if ($(".login-modal").length) {
            const t = currentTranslations.login || {};
            $(".login-modal h2").text(t.title || "Login!");
            $(".login-modal #username").attr("placeholder", t.username || "Username");
            $(".login-modal #password").attr("placeholder", t.password || "Password");
            $(".login-modal .register-link").text(t.register_link || "Don't have an account? Register");
            $("#submitLogin").text(t.submit || "Login");
            $("#submitLogout").text(t.cancel || "Cancel");
        }
    }

    // Function to change language
    function changeLanguage(lang) {
        $.getJSON(`./locales/${lang}.json`, function(translations) {
            currentTranslations = translations;
            currentLanguage = lang;
            
            // Update UI elements
            $("#selected-flag").attr("src", flagMap[lang].img);
            $("#selected-lang").text(flagMap[lang].name);
            localStorage.setItem("lang", lang);
            
            // Apply translations
            applyTranslations();
        }).fail(function() {
            console.error("Failed to load language file");
            if (lang !== "en") changeLanguage("en");
        });
    }

    // Initialize
    changeLanguage(currentLanguage);
    
    // Language selector handlers
    $(".dropdown-btn").click(function() {
        $(".dropdown-menu").toggle();
    });

    $(".dropdown-menu li").click(function() {
        const selectedLang = $(this).data("lang");
        changeLanguage(selectedLang);
        $(".dropdown-menu").hide();
    });

    $(document).click(function(e) {
        if (!$(e.target).closest(".dropdown").length) {
            $(".dropdown-menu").hide();
        }
    });

    // Make functions available globally
    window.changeLanguage = changeLanguage;
    window.applyTranslations = applyTranslations;
    window.updateDynamicContent = updateDynamicContent;
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
        // Create modal HTML
        const modalHTML = `
        <div class="login-modal">
            <div class="login-container">
                <h2 data-i18n="login_title">Login!</h2>
                <form id="loginForm">
                    <div class="input-group">
                        <i class="fas fa-user"></i>
                        <input id="username" type="text" name="username" data-i18n="[placeholder]login_username" placeholder="Username" required>
                        <i class="fas fa-times clear-icon" id="clearUsername"></i>
                    </div>
                </form>
    
                <form id="loginForm1">
                    <div class="input-group">
                        <i class="fas fa-lock"></i>
                        <input id="password" type="password" name="password" data-i18n="[placeholder]login_password" placeholder="Password" required>
                        <i class="fas fa-eye-slash" id="togglePassword"></i>
                    </div>
                </form>
    
                <a href="register.html" class="register-link" data-i18n="login_register_link">Don't have an account? Register</a>
    
                <div class="last_btn_confirm">
                    <button type="submit" id="submitLogin" class="btn-login2" data-i18n="login_submit">Login</button>
                    <button type="submit" id="submitLogout" class="btn-login3" data-i18n="logincancel">Cancel</button>
                </div>
            </div>
        </div>
        `;
    
        // Show modal using Swal (SweetAlert2)
        Swal.fire({
            html: modalHTML,
            showConfirmButton: false,
            showCancelButton: false,
            allowOutsideClick: true,
            width: '700px',
            background: 'transparent',

            willOpen: () => {
                // Initialize password toggle
                $("#togglePassword").click(function() {
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
    
                // Initialize clear icon
                $("#clearUsername").click(function() {
                    $("#username").val("").focus();
                });

                // Cancel button (FIXED)
                $("#submitLogout").click(function() {
                    Swal.close();
                });
            }
        });
    
        // Handle form submission
        $("#submitLogin").on("click", function(e) {
            e.preventDefault();
            
            let username = $("#username").val();
            let password = $("#password").val();
    
            // Validation
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
                title: "⏳ Please wait...",
                text: "Logging in",
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading(),
                timer: 2000
            });
    
            $.ajax({
                url: "http://127.0.0.1:8000/api/login/",
                type: "POST",
                contentType: "application/json",
                data: JSON.stringify({ username: username, password: password }),
                success: function (response) {
                    if (response.token) {
                        localStorage.setItem("token", response.token);
                        localStorage.setItem("username", username);
                    }
                    alert("you loggin")
    
                    if (response.status === true || response.success) {
                        Swal.close();
                        window.location.href = './main.html';
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
                            errorMessage = xhr.responseJSON.detail;
                        } else if (xhr.responseJSON.error) {
                            errorMessage = xhr.responseJSON.error;
                        } else if (xhr.responseJSON.non_field_errors) {
                            errorMessage = xhr.responseJSON.non_field_errors.join(", ");
                        } 
                    } 
                    else if (xhr.responseText) {
                        errorMessage = xhr.responseText;
                    };
    
                    Swal.fire({
                        title: 'Error!',
                        text: errorMessage,
                        icon: 'error'
                    });
                },
            });
        });
    });

    $("#submitLogout").click(function() {
        Swal.close(); // Close the active SweetAlert popup
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
        








    //     $(document).ready(function () {
    //         $('#shortenButton').on('click', function () {
    //             const originUrl = $('#originUrlInput').val();
        
    //             $.ajax({
    //                 url: 'http://127.0.0.1:8000/api/shorten-url/',
    //                 type: 'POST',
    //                 contentType: 'application/json',
    //                 data: JSON.stringify({ origin_url: originUrl }),
    //                 success: function (response) {
    //                     $('#shortUrlDisplay').html(`
    //                         <a href="${response.short_url}" target="_blank">${response.short_url}</a>
    //                     `);
    //                 },
    //                 error: function () {
    //                     alert('Failed to shorten URL');
    //                 }
    //             });
    //         });
    //     });
        
        
    //   // Input_url
    //     $("#submit_btn").click(function () {
    //     let originalUrl = $("#input_url").val().trim(); 

    //     if (originalUrl === "") {
    //         Swal.fire("Error", "Please enter a URL!", "error");
    //         return;
    //     };

    //     $.ajax({
    //         url: "http://127.0.0.1:8000/api/shorten-url/", 
    //         type: "POST",
    //         contentType: "application/json",
    //         data: JSON.stringify({ origin_url: originalUrl }),
    //         success: function (response) {
    //             Swal.fire("Success", "URL successfully shortened!", "success");

    //             $("#input_url").val("");

    //             table.ajax.reload();
    //         },
    //         error: function (xhr) {
    //             Swal.fire("Error", "Failed to shorten URL: " + xhr.responseText, "error");
    //         }
    //     });
    // });




