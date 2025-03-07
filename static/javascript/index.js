$(document).ready(function () {
    // Register
    $('#register').click(function() {
        window.location.href = "./register.html";
    }),

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
                                    Swal.fire({
                                        title: 'Success!',
                                        text: 'Login successful',
                                        icon: 'success',
                                        didOpen: () => {
                                            $(".swal2-container").css("z-index", "9999"); 
                                        }
                                    }).then(() => {
                                        window.location.href = './main.html';
                                    });
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
});


$(document).ready(function () {
    let user = $('#myTable');
    let lastRow = $(".blur-background").detach(); // Remove it before DataTables initializes

    let table = user.DataTable({
        // scrollX: true,
        // processing: true,
        // serverSide: true,
        // autoWidth: false,  
        pageLength: 5,
        lengthChange: false,
        ordering: false,
        searching: false,
        paging: false,
        info:false,
        // ajax: {
        //     url: 'http://127.0.0.1:8000/api/shorten/urls',
        //     type: 'GET',
        //     data: function (d) {  
        //         d.page = Math.floor(d.start / d.length) + 1; // Calculate page correctly
        //         d.page_size = d.length;  // Ensure Django receives correct page size
        //     },

        //     dataSrc: function (json) {
        //         json.recordsTotal = json.count;  // Set total records
        //         json.recordsFiltered = json.count;  // Set filtered records count
        //         return json.results;  // Extract data array from Django's paginated response
        //     }
        // },
        // columns: [
        //     { data: 'id', title: 'ID', searchable: false, visible: false },
        //     { data: 'shorten_url', title: 'Short Link'},
        //     { data: 'origin_url', title: 'Original Link' },
        //     {
        //         data: null,
        //         title: 'QR Code',
        //         createdCell: function (td, cellData, rowData, row, col) {
        //             // Create a unique ID for the QR code container and modal
        //             let qrId = `qr-${rowData.id}`;
        //             let modalId = `qr-modal-${rowData.id}`;

        //             // Add QR code and modal structure (without close button)
        //             $(td).html(`
        //                 <div id="${qrId}" class="qr-container" style="cursor:pointer;"></div>
                        
        //                 <!-- Hidden Modal for Enlarged QR -->
        //                 <div id="${modalId}" class="qr-modal" style="display:none; position:fixed; top:50%; left:50%;
        //                     transform:translate(-50%, -50%); background:#fff; padding:10px; border-radius:8px; 
        //                     box-shadow:0px 0px 10px rgba(0,0,0,0.2);">
        //                     <div id="large-${qrId}"></div>
        //                 </div>
        //             `);

        //             // Generate Small QR Code
        //             if (rowData.id && rowData.shorten_url) {
        //                 setTimeout(() => {
        //                     new QRCode(document.getElementById(qrId), {
        //                         text: rowData.shorten_url,
        //                         width: 70,
        //                         height: 60
        //                     });
        //                 }, 10);
        //             } else {
        //                 console.error("Error: Missing ID or Shortened URL", rowData);
        //             }

        //             // Add Click Event for Enlarging QR Code
        //             $(td).find(`#${qrId}`).click(function (e) {
        //                 let largeQRContainer = document.getElementById(`large-${qrId}`);
        //                 largeQRContainer.innerHTML = ""; // Clear previous QR
        //                 new QRCode(largeQRContainer, {
        //                     text: rowData.shorten_url,
        //                     width: 200,
        //                     height: 200
        //                 });

        //                 // Show Modal
        //                 $(`#${modalId}`).fadeIn();

        //                 // Stop event from bubbling up (prevents immediate closing)
        //                 e.stopPropagation();
        //             });

        //             // Close Modal on Clicking Outside the QR Code
        //             $(document).on("click", function (e) {
        //                 // Check if clicked area is NOT inside the modal or small QR code
        //                 if (!$(e.target).closest(`.qr-modal, #${qrId}`).length) {
        //                     $(`#${modalId}`).fadeOut();
        //                 }
        //             });






        //         }
        //     },


        //     { data: 'clicks', title: 'Clicks' },
        //     {   data: 'status', 
        //         title: 'Status',

        //     },
        //     { 
        //         data: 'created_at', 
        //         title: 'Date', 
        //         render: function (data, type, row) {
        //             if (!data) return '';  
        //             var date = new Date(data);  
        //             var options = { month: 'short', day: '2-digit', year: 'numeric' };
        //             return date.toLocaleDateString('en-US', options).replace(',', '');
        //         }
        //     }
        // ],
        columnDefs: [
            // { targets: 0, width: "5%" },
            { targets: 0, width: "20%" },
            { targets: 1, width: "20%" },
            { targets: 2, width: "15%" },
            { targets: 3, width: "10%" },
            { targets: 4, width: "10%" },
            { targets: 5, width: "10%" }
        ],

        rowCallback: function (row, data, index) {
            // Prevent DataTables from processing the last row
            if ($(row).hasClass("blur-background")) {
                $(row).removeAttr("role"); // Remove accessibility attributes that affect sorting
            }
        },
        createdRow: function (row, data, dataIndex) {
            if ($(row).hasClass("blur-background")) {
                $(row).addClass("no-sort");
            }
        }

        });






        
      // Input_url
        $("#submit_btn").click(function () {
        let originalUrl = $("#input_url").val().trim(); 

        if (originalUrl === "") {
            Swal.fire("Error", "Please enter a URL!", "error");
            return;
        }

        $.ajax({
            url: "http://127.0.0.1:8000/api/shorten/", 
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({ origin_url: originalUrl }),
            success: function (response) {
                Swal.fire("Success", "URL successfully shortened!", "success");

                $("#input_url").val("");

                table.ajax.reload();
            },
            error: function (xhr) {
                Swal.fire("Error", "Failed to shorten URL: " + xhr.responseText, "error");
            }
        });
    });

})


