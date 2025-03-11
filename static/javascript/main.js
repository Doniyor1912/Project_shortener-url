$(document).ready(function () {
    let token = localStorage.getItem("token");
    let username = localStorage.getItem("username"); 

    if (!token) {
        window.location.href = "index.html"; 
    }
    $("#profile_title").text(username);



    //############################### LOGOUT ###############################
    $("#logout_btn").click(function (e) {
        e.preventDefault(); // Prevent default button behavior


        Swal.fire({
            title: "You will be logged out!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Logout",
            cancelButtonText: "Cancel",
            customClass: {
                popup: "custom-swal-popup",
                confirmButton: "swal-confirm-btn",
                cancelButton: "swal-cancel-btn"
                }
        }).then((result) => {
            if (result.isConfirmed) logout()
            else if (result.dismiss === Swal.DismissReason.cancel) Swal.close()
        });

    
    });

    // ##############################################################################################################################
    // DataTable
    let user = $('#userTable');

    let table = user.DataTable({
        scrollX:true,
        processing: true,
        serverSide: true,
        autoWidth: false,  
        responsive: false,
        pageLength: 10,
        lengthChange: false,
        ordering: false,
        searching: false,
        paging: true,
        info:false,
        ajax: {
            url: 'http://127.0.0.1:8000/api/shorten/get-all/',
            type: 'GET',
            headers: {
                "Authorization": "Token " + token
            },
            data: function (d) {  
                d.page = Math.floor(d.start / d.length) + 1; // Calculate page correctly
                d.page_size = d.length;  // Ensure Django receives correct page size
            },

            dataSrc: function (json) {
                json.recordsTotal = json.count;  // Set total records
                json.recordsFiltered = json.count;  // Set filtered records count
                return json.results;  // Extract data array from Django's paginated response
            },

            error: function(xhr, status, error) {
                if (xhr.status === 401) {
                    alert("Unauthorized! Please log in again.");
                    window.location.href = "index.html";
                }
            }
        },
        columns: [
            { data: 'id', title: 'ID', searchable: false, visible: false },
            { 
                data: 'shorten_url', 
                title: 'Short Link',
                render: function(data, type, row) {
                    return `
                        <div class="copy-container">
                            <span class="short-link">${data}</span>
                            <button class="copy-btn" onclick="copyToClipboard('${data}')">
                                <i class="fas fa-copy"></i> 
                            </button>
                        </div>
                    `;
                }
                
            },
            { data: 'origin_url', title: 'Original Link', },
            {
                data: null,
                title: 'Qr Code',
                createdCell: function (td, cellData, rowData, row, col) {
                    // Create a unique ID for the QR code container and modal
                    let qrId = `qr-${rowData.id}`;
                    let modalId = `qr-modal-${rowData.id}`;

                    // Add QR code and modal structure (without close button)
                    $(td).html(`
                        <div id="${qrId}" class="qr-container" style="cursor:pointer;"></div>
                        
                        <!-- Hidden Modal for Enlarged QR -->
                        <div id="${modalId}" class="qr-modal" style="display:none; position:fixed; top:50%; left:50%;
                            transform:translate(-50%, -50%); background:#fff; padding:10px; border-radius:8px; 
                            box-shadow:0px 0px 10px rgba(0,0,0,0.2);">
                            <div id="large-${qrId}"></div>
                        </div>
                    `);

                    // Generate Small QR Code
                    if (rowData.id && rowData.shorten_url) {
                        setTimeout(() => {
                            new QRCode(document.getElementById(qrId), {
                                text: rowData.shorten_url,
                                width: 60,
                                height: 55
                            });
                        }, 10);
                    } else {
                        console.error("Error: Missing ID or Shortened URL", rowData);
                    }

                    // Add Click Event for Enlarging QR Code
                    $(td).find(`#${qrId}`).click(function (e) {
                        let largeQRContainer = document.getElementById(`large-${qrId}`);
                        largeQRContainer.innerHTML = ""; // Clear previous QR
                        new QRCode(largeQRContainer, {
                            text: rowData.shorten_url,
                            width: 200,
                            height: 200
                        });

                        // Show Modal
                        $(`#${modalId}`).fadeIn();

                        // Stop event from bubbling up (prevents immediate closing)
                        e.stopPropagation();
                    });

                    // Close Modal on Clicking Outside the QR Code
                    $(document).on("click", function (e) {
                        // Check if clicked area is NOT inside the modal or small QR code
                        if (!$(e.target).closest(`.qr-modal, #${qrId}`).length) {
                            $(`#${modalId}`).fadeOut();
                        }
                    });
                }

            },


            { data: 'clicks', title: 'Clicks', },

            { 
                data: 'status', 
                title: 'Status',
                render: function(data, type, row) {
                    if (data == 1) {
                        return '<span style="color: green; font-weight: bold;">' +
                            'Active <i class="fas fa-link"></i>' + 
                            '</span>';
                    } else {
                        return '<span style="color: orange; font-weight: bold;">' +
                            'Inactive <i class="fas fa-unlink"></i>' + 
                            '</span>';
                    }
                }
            },

            { 
                data: 'created_at', 
                title: 'Date',
                render: function (data, type, row) {
                    if (!data) return '';  
                    var date = new Date(data);  
                    var options = { month: 'short', day: '2-digit', year: 'numeric' };
                    return date.toLocaleDateString('en-US', options).replace(',', '');
                }
            },
            
            {
                data: null,
                title: 'Actions',
                orderable: false,
                searchable: false,
                className: 'text-center', // Center-align the buttons
                render: function (data, type, row) {
                    // Check if the user is soft-deleted
                    const isDeleted = row.deleted_at !== null;

                    // Return the HTML for the action buttons
                    return `
                <div class="d-flex text-center">

                    <button class="btn btn-sm btn-warning edit-link " data-id="${row.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-link " data-id="${row.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                    `;
                },
            }
        ],
        columnDefs: [
            { targets: 0, width: "4%" },
            { targets: 1, width: "25%" },
            { targets: 2, width: "35%" },
            { targets: 3, width: "10%" },
            { targets: 4, width: "6%" },
            { targets: 5, width: "8%" },
            { targets: 6, width: "10%" },
            { targets: 7, width: "8%" }
        ],
        drawCallback: function(settings) {
            let totalRecords = settings.json.recordsTotal;  
            $('#count_link').text('History ' + '('+ totalRecords +')'); 
        },
    });




    //#######################------------DELETE AND EDIT ACTION------------

    $(document).on('click', '.edit-link', function() {
        // Get the row data using DataTables API
        let table = $('#userTable').DataTable();
        let row = $(this).closest('tr');
        let rowData = table.row(row).data();

        // Generate read-only inputs for all fields except status
        var formHtml = `
            <td><input type="text" value="${rowData.shorten_url}" readonly class="form-control"></td>
            <td><input type="text" value="${rowData.origin_url}" readonly class="form-control"></td>
            <td>
                <div class="qr-readonly">
                    <div id="qr-readonly-${rowData.id}" class="qr-container"></div>
                </div>
            </td>
            <td><input type="number" value="${rowData.clicks}" readonly class="form-control"></td>
            <td>
                <select class="form-control" id="editStatus">
                    <option value="1" ${rowData.status == 1 ? 'selected' : ''}>Active</option>
                    <option value="0" ${rowData.status == 0 ? 'selected' : ''}>Inactive</option>
                </select>
            </td>
            <td><input type="text" value="${rowData.created_at}" readonly class="form-control"></td>
            <td>
                <button class="btn btn-sm btn-success save-link" data-id="${rowData.id}">
                    <i class="fas fa-save"></i>
                </button>
                <button class="btn btn-sm btn-secondary cancel-edit">
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;

        // Replace the row content with the edit form
        row.html(formHtml);
        // Generate the QR Code when the row is in edit mode
        setTimeout(() => {
            let qrContainerId = `qr-readonly-${rowData.id}`;
            let qrContainer = document.getElementById(qrContainerId);

            // Clear existing QR code if any
            qrContainer.innerHTML = "";

            // Generate a new QR code
            new QRCode(qrContainer, {
                text: rowData.shorten_url,
                width: 60,
                height: 60
            });
        }, 10);

    });


    $(document).on('click', '.save-link', function() {
        let id = $(this).data('id');
        let status = $('#editStatus').val();
        let $button = $(this);

        // ✅ Validation: Check if status is valid
        if (!status) {
            alert("Please select a valid status.");
            return;
        }

        // Disable button to prevent multiple submissions
        $button.prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i> Saving...');

        $.ajax({
            url: `http://127.0.0.1:8000/api/shorten/urls/${id}/`,
            type: 'PUT',
            headers: {
                "Authorization": "Token " + token,
                "Content-Type": "application/json"
            },
            data: JSON.stringify({ status: parseInt(status) }),

            success: function() {
                $('#userTable').DataTable().ajax.reload(); // Refresh DataTable
                alert("Status updated successfully!");
            },

            error: function(xhr, status, error) {
                let errorMessage = "Failed to update status";
                
                if (xhr.status === 400) {
                    errorMessage = "Validation error: " + (xhr.responseJSON?.detail || "Invalid input");
                } else if (xhr.status === 401) {
                    errorMessage = "Unauthorized access. Please log in again.";
                    window.location.href = "index.html"; // Redirect to login if unauthorized
                } else if (xhr.status === 500) {
                    errorMessage = "Server error. Please try again later.";
                }

                alert(errorMessage);
            },

            complete: function() {
                $button.prop('disabled', false).html('<i class="fas fa-save"></i>'); // Re-enable button
            }
        });
    });

    $(document).on('click', '.cancel-edit', function () {
        // Find the row being edited and revert it
        let row = $(this).closest('tr');
        let table = $('#userTable').DataTable();

        // Redraw the row with the original data
        let rowData = table.row(row).data();
        table.row(row).data(rowData).draw(false);
    });

        // ------------------------------------------------------

        // Handle Delete Button with SweetAlert2
    $(document).on('click', '.delete-link', function () {
        const id = $(this).data('id');  // Get the ID from the data attribute

        // Show confirmation dialog using Swal.fire
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'Cancel'
        }).then((result) => {
            if (result.isConfirmed) {
                // Perform the DELETE request if confirmed
                $.ajax({
                    url: `http://127.0.0.1:8000/api/shorten/urls/${id}/`,
                    type: 'DELETE',
                    headers: {
                        "Authorization": "Token " + token
                    },
                    success: function () {
                        Swal.fire(
                            'Deleted!',
                            'Your link has been deleted.',
                            'success'
                        );
                        $('#userTable').DataTable().ajax.reload(); // Refresh DataTable
                    },
                    error: function (xhr, status, error) {
                        console.error('Failed to delete link:', error);
                        Swal.fire(
                            'Failed!',
                            'Failed to delete link. Please try again.',
                            'error'
                        );
                    }
                });
            }
        });
    });







                




                
            //###########################-----Input_url-------###################################
        $("#btn_submit").click(function () {
        let originalUrl = $("#url_input").val().trim(); 

        if (originalUrl === "") {
            Swal.fire("Error", "Please enter a URL!", "error");
            return;
        }

        $.ajax({
            url: "http://127.0.0.1:8000/api/shorten/", 
            type: "POST",
            headers: {
                "Authorization": "Token " + token
            },
            contentType: "application/json",
            data: JSON.stringify({ origin_url: originalUrl }),
            success: function (response) {
                // Swal.fire("Success", "URL successfully shortened!", "success");

                $("#url_input").val("");

                table.ajax.reload();
            },
            error: function (xhr) {
                Swal.fire("Error", "Failed to shorten URL: " + xhr.responseText, "error");
            }
        });
    })



            //-------------------------------------------------------OUTSIDE OF DATATABLE-----------------------------------------------------
            //###########################-----LOGOUT---###################################################################
            function logout() {
                let token = localStorage.getItem("token");

                if (!token) {
                    window.location.href = "index.html";
                    return;
                }

                $.ajax({
                    url: "http://127.0.0.1:8000/api/logout/", 
                    type: "POST",
                    headers: {
                        "Authorization": "Token " + token 
                    },
                    success: function() {
                        localStorage.removeItem("token");
                        Swal.fire({
                                    title: "Logged Out",
                                    text: "You have been logged out successfully!",
                                    icon: "success",
                                    timer: 2000,
                                    showConfirmButton: false
                                }).then(() => {
                                    window.location.href = "index.html";
                                });
                    },
                    error: function(xhr) {
                        alert("Logout failed: " + xhr.responseText);
                    }
                });
            }

            //########################################################################################################## 

            //##########################--------COPY-BUTTON-----------################################### 

            $(document).ready(function () {
                // Attach event listener to dynamically created buttons
                $(document).on("click", ".copy-btn", function () {
                    let text = $(this).siblings(".short-link").text().trim(); // Get the text inside .short-link
            
                    if (text) {
                        copyToClipboard(text);
                    } else {
                        showToast("⚠️ No text found to copy!");
                    }
                });
            });
            
            // Function to copy text to clipboard
            function copyToClipboard(text) {
                navigator.clipboard.writeText(text)
                    .then(() => {
                        showToast("✅ Copied: " + text);
                    })
                    .catch(err => {
                        console.error("Failed to copy text:", err);
                        showToast("❌ Copy failed!");
                    });
            }
            
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
            
            
})



























































            // #########################################################################

              // Swal.fire({
                //     title: "Are you sure?",
                //     text: "You will be logged out!",
                //     icon: "warning",
                //     showConfirmButton: false, // Hide default confirm button
                    // html: `
                    //     <button id="confirm-logout" class="swal2-confirm swal2-styled" style="background:#d33; margin-right:10px;">Logout</button>
                    //     <button id="cancel-logout" class="swal2-cancel swal2-styled" style="background:#3085d6;">Cancel</button>
                    // `,
                    // customClass: {
                    //     popup: "custom-swal-popup" // Apply a custom CSS class
                    // },
                    // allowOutsideClick: true,
                    // allowEscapeKey: false,
                    // didOpen: () => {
                    //     // When the Swal modal opens, attach event listeners
                    //     document.getElementById("confirm-logout").addEventListener("click", function () {
                    //         // Send request to backend for logout
                    //         $.ajax({
                    //             url: "http://127.0.0.1:8000/api/logout/", // Adjust to your backend logout URL
                    //             type: "POST",
                    //             success: function () {
                    //                 Swal.fire({
                    //                     title: "Logged Out",
                    //                     text: "You have been logged out successfully!",
                    //                     icon: "success",
                    //                     timer: 2000, // Auto-close after 2 seconds
                    //                     showConfirmButton: false
                    //                 }).then(() => {
                    //                     window.location.href = "index.html"; // Redirect to homepage
                    //                 });
                    //             },
                    //             error: function () {
                    //                 Swal.fire("Error", "Something went wrong!", "error");
                    //             }
                    //         });
                    //     });

                    //     document.getElementById("cancel-logout").addEventListener("click", function () {
                    //         Swal.close(); // Close the modal when Cancel is clicked
                    //     });
                    // }
                // });