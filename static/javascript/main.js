






$(document).ready(function () {
    // ======================
    // 1. CONSTANTS & CONFIG
    // ======================
    const API_BASE_URL = 'http://127.0.0.1:8000';
    const ONE_MINUTE = 60 * 1000;

    // ======================
    // 2. UTILITY FUNCTIONS
    // ======================
    function getAuthToken() {
        return localStorage.getItem("token") || "";
    }

    if (!getAuthToken()) {
        window.location.href = "./index.html"; 
    }

    const username = localStorage.getItem("username")
    $("#username").text(username);

    function showMessage(type, message) {
        Swal.fire({
            icon: type === "success" ? "success" : "error",
            title: type === "success" ? "Success!" : "Error!",
            text: message,
            showConfirmButton: true,
            confirmButtonText: "OK"
        });
    }

    function loadLanguage(lang) {
        $.getJSON(`./locales/${lang}.json`, function (data) {
            $("[data-i18n]").each(function () {
                var key = $(this).data("i18n");
                if (data[key]) {
                    if ($(this).is("input, textarea")) {
                        $(this).attr("placeholder", data[key]); // For input placeholders
                    } else {
                        $(this).html(data[key]); // For other elements
                    }
                }
            });
        });
    }

    // Load default language (English)
    let selectedLang = localStorage.getItem("selectedLang") || "en";
    $("#language-selector").val(selectedLang);
    loadLanguage(selectedLang);

    // Change language on selection
    $("#language-selector").change(function () {
        let newLang = $(this).val();
        localStorage.setItem("selectedLang", newLang); // Save language preference
        loadLanguage(newLang);
    });

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

    function loadUserUrls() {
        if (window.userTable) {
            window.userTable.ajax.reload();
        }
    }

    // ======================
    // 3. AUTH & SESSION MANAGEMENT
    // ======================
    // Last login notification
    const lastLogin = localStorage.getItem("lastLogin");
    const now = new Date().getTime();

    if (!lastLogin || (now - lastLogin) > ONE_MINUTE) {
        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: "Welcome back! 🎉",
            text: "Siz uzoq vaqt davomida tizimga kirmadingiz.",
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            background: "#0B1120",
            color: "#ffffff"
        });
    }
    localStorage.setItem("lastLogin", now);

    // Logout functionality
    document.getElementById("logout-btn").addEventListener("click", function () {
        const token = getAuthToken();
        if (!token) {
            showMessage("error", "You are not logged in!");
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "Do you really want to log out?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: "⏳ Logging out...",
                    allowOutsideClick: false,
                    didOpen: () => Swal.showLoading()
                });

                fetch(`${API_BASE_URL}/api/logout/`, {
                    method: "POST",
                    headers: {
                        "Authorization": "Token " + token
                    }
                })
                .then(response => {
                    if (!response.ok) throw new Error('Logout failed');
                    return response.json();
                })
                .then(data => {
                    localStorage.removeItem("token");
                    window.location.href = "index.html";
                })
                .catch(error => {
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: error.message || "Something went wrong!",
                        confirmButtonText: "OK"
                    });
                });
            }
        });
    });

    // ======================
    // 4. UI COMPONENTS
    // ======================
    // Profile Dropdown
    $(".profile-btn").click(function (event) {
        event.stopPropagation();
        $(".profile-container").toggleClass("active");
    });

    $(document).click(function (event) {
        if (!$(event.target).closest(".profile-container, .profile-btn").length) {
            $(".profile-container").removeClass("active");
        }
    });

    // Welcome tooltip animation
    let tooltip = $("#welcome-tooltip");
    tooltip.css({ opacity: "1", transform: "translateY(0)" });
    setTimeout(() => {
        tooltip.css({ opacity: "0", transform: "translateY(0)" });
        setTimeout(() => tooltip.remove(), 500);
    }, 3000);

    // History count
    function updateHistoryCount() {
        let tableBody = document.getElementById("url-table-body");
        let rowCount = tableBody.getElementsByTagName("tr").length;
        document.getElementById("history-count").innerText = `History (${rowCount})`;
    }
    
    const observer = new MutationObserver(updateHistoryCount);
    observer.observe(document.getElementById("url-table-body"), { childList: true });

    // ======================
    // 5. URL SHORTENER
    // ======================
    function showModal(shortLink) {
        const successModal = $("#successModal");
        $("#shortLink").attr("href", shortLink).text(shortLink);
        successModal.css("display", "block");
    }

    $(".close-btn").click(function () {
        $("#successModal").hide();
    });

    $(window).click(function (event) {
        if (event.target.id === "successModal") {
            $("#successModal").hide();
        }
    });

    function shortenUrl() {
        let originalUrl = $(".url-input").val().trim();
        if (!originalUrl) {
            showMessage("error", "Введите URL!");
            return;
        }
    
        if (!/^https?:\/\//i.test(originalUrl)) {
            originalUrl = "http://" + originalUrl;
        }

        $.ajax({
            url: `${API_BASE_URL}/api/shorter/`,
            method: "POST",
            contentType: "application/json",
            headers: { "Authorization": "Token " + getAuthToken() },
            data: JSON.stringify({ original_link: originalUrl }),
            success: function (response) {
                $(".url-input").val("");
                showMessage("success", "✅ URL successfully shortened!");
                loadUserUrls();
                
                if (response.short_link) {
                    showModal(response.short_link);
                }
            },
            error: function (xhr) {
                let errorMessage = xhr.responseJSON?.message || "An error occurred! Please try again.";
                showMessage("error", errorMessage);
            }
        });
    }

    $(".shorten-btn").on("click", shortenUrl);
    $(".url-input").keypress(function (event) {
        if (event.which === 13) shortenUrl();
    });

    // ======================
    // 6. DATATABLE CONFIGURATION
    // ======================
    window.userTable = $('#urlTable').DataTable({
        scrollX: false,
        processing: true,
        serverSide: true,
        autoWidth: false,
        responsive: false,
        pageLength: 20,
        lengthChange: false,
        ordering: false,
        searching: false,
        paging: true,
        info: false, 
        order: [[5, 'desc']],
        ajax: {
            url: `${API_BASE_URL}/api/shorten/list/`,
            type: 'GET',
            headers: {
                "Authorization": "Token " + getAuthToken()
            },
            data: function (d) {  
                let savedFilters = JSON.parse(localStorage.getItem('globalFilters')) || {};
                d.search_short = savedFilters.search_short ?? $('#searchInput_short').val();
                d.status = savedFilters.status ?? $('#statusFilter').val(); 
                d.start_date = savedFilters.start_date ?? $('#start-date-filter').val();
                d.end_date = savedFilters.end_date ?? $('#end-date-filter').val();
            },
            dataSrc: function (json) {
                json.recordsTotal = json.count;
                json.recordsFiltered = json.count;
                return json.results;
            },
            error: function(xhr) {
                if (xhr.status === 401) {
                    showMessage("error", "Session expired. Please login again.");
                    window.location.href = "index.html";
                }
            }
        },
        columns: [
            { data: 'id', title: 'ID', visible: false },
            {
                data: 'short_link',
                title: 'Short Link',
                render: function (data) {
                    return `<div class="copy-container">
                                <span class="short-link" data-link="${data}">${data}</span>
                                <button class="copy-btn" data-link="${data}">
                                    <i class="fas fa-copy"></i>
                                </button>
                            </div>`;
                }
            },
            {
                data: 'original_link',
                title: 'Original Link',
                render: function (data) {
                    return `<a href="${data}" target="_blank" class="org-link">${data}</a>`;
                }
            },

            {
                data: null,
                title: 'QR Code',
                createdCell: function (td, cellData, rowData, row, col) {
                    // Create a unique ID for the QR code container and modal
                    let qrId = `qr-${rowData.id}`;
                    let modalId = `qr-modal-${rowData.id}`;
                    
                    // Add QR code image and modal structure
                    $(td).html(`
                        <img src="../static/images/image 4.svg" id="${qrId}" class="qr-container" style="cursor:pointer; width: 60px; height: 55px;" alt="QR Code Placeholder">
                        
                        <!-- Hidden Modal for Enlarged QR -->
                        <div id="${modalId}" class="qr-modal" style="display:none; position:fixed; top:50%; left:50%;
                            transform:translate(-50%, -50%); background:#fff; padding:10px; border-radius:8px; 
                            box-shadow:0px 0px 10px rgba(0,0,0,0.2);">
                            <div id="large-${qrId}"></div>
                        </div>
                    `);
            
                    // Add Click Event for Enlarging QR Code
                    $(td).find(`#${qrId}`).click(function (e) {
                        let modal = $(`#${modalId}`);
                        
                        // QR kodni toza yaratish
                        let largeQRContainer = document.getElementById(`large-${qrId}`);
                        largeQRContainer.innerHTML = "";
                        new QRCode(largeQRContainer, {
                            text: rowData.short_link,  // **short_link ni ishlatish**
                            width: 200,
                            height: 200
                        });
                    
                        $(".qr-modal-overlay").fadeIn();  // Yopish foni chiqadi
                        modal.fadeIn();
                        e.stopPropagation();
                    });
                    
                    // Modalni yopish
                    $(".qr-modal-overlay, .qr-modal").click(function (e) {
                        if (!$(e.target).closest('.qr-modal img').length) {
                            $(".qr-modal-overlay").fadeOut();
                            $(".qr-modal").fadeOut();
                        }
                    });
                    
            
                    // Close Modal on Clicking Outside the QR Code
                    $(document).on("click", function (e) {
                        if (!$(e.target).closest(`.qr-modal, #${qrId}`).length) {
                            $(`#${modalId}`).fadeOut();
                        }
                    });
                }
            },

            {
                data: 'clicks',
                title: 'Clicks',
                render: function (data) {
                    return `<span class="click-count">${data}</span>`;
                }
            },

            {
                data: 'status',
                title: 'Status',
                render: function (data) {
                    const isActive = String(data).toLowerCase() === "true" || data === true || data === 1;
                    return `<span class="status ${isActive ? 'active' : 'inactive'}">
                        ${isActive ? 'Active' : 'Inactive'} 
                        <i class="fas fa-${isActive ? 'link' : 'unlink'}"></i>
                    </span>`;
                }
            },
            {
                data: 'created_at',
                title: 'Date',
                render: function (data) {
                    return `<span class="text-white">${new Date(data).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: '2-digit', 
                        year: 'numeric' 
                    })}</span>`;
                }
            },
            {
                data: null,
                title: 'Actions',
                orderable: false,
                render: function (data, type, row) {
                    return `<button class="action-btn delete-user" data-id="${row.id}">
                                <i class="fas fa-trash"></i>
                            </button>
                            <button class="action-btn edit-status" data-id="${row.id}" data-status="${row.status}">
                                <i class="fas fa-edit"></i>
                            </button>`;
                }
            }
        ]
    });

    // ======================
    // 7. FILTER FUNCTIONALITY
    // ======================
    let modal = $("#filter-modal");
    $("#open-filter-modal").click(function () {
        let savedFilters = JSON.parse(localStorage.getItem('globalFilters')) || {};
        $("#short-link-filter").val(savedFilters.search_short || "");
        $("#status-filter").val(savedFilters.status || "");
        $("#start-date-filter").val(savedFilters.start_date || "");
        $("#end-date-filter").val(savedFilters.end_date || "");
        modal.show();
    });

    $(".close").click(function () {
        modal.hide();
    });

    $(window).click(function (event) {
        if ($(event.target).is(modal)) {
            modal.hide();
        }
    });

    $("#apply-filter").click(function () {
        let startDate = $("#start-date-filter").val();
        let endDate = $("#end-date-filter").val();
    
        if (startDate && endDate && startDate > endDate) {
            showMessage("error", "Start date cannot be greater than end date");
            return;
        }
    
        let filters = {
            search_short: $("#short-link-filter").val().trim(),
            status: $("#status-filter").val(),
            start_date: startDate,
            end_date: endDate
        };
    
        localStorage.setItem('globalFilters', JSON.stringify(filters));
        loadUserUrls();
        showMessage("success", "Filters applied");
        modal.hide();
    });
    
    $("#clear-filter-btn").click(function () {
        localStorage.removeItem('globalFilters');
        $("#short-link-filter, #original-link-filter, #status-filter, #start-date-filter, #end-date-filter").val("");
        loadUserUrls();
        showMessage("success", "Filters cleared");
        modal.hide();
    });

    // ======================
    // 8. URL MANAGEMENT ACTIONS
    // ======================
    // Delete URL
    $(document).on("click", ".delete-user", function () {
        let urlId = $(this).data("id");
        if (!urlId) {
            showMessage("error", "ID not found!");
            return;
        }

        Swal.fire({
            title: "Are you sure?",
            text: "This URL will be permanently deleted!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
            cancelButtonText: "Cancel"
        }).then((result) => {
            if (result.isConfirmed) {
                $.ajax({
                    url: `${API_BASE_URL}/api/shorten/delete/${urlId}/`,
                    method: "DELETE",
                    headers: { "Authorization": "Token " + getAuthToken() },
                    success: function () {
                        showMessage("success", "URL successfully deleted.");
                        loadUserUrls();
                    },
                    error: function () {
                        showMessage("error", "An error occurred while deleting!");
                    }
                });
            }
        });
    });

    // Update status
    $(document).on("click", ".edit-status", function () {
        let urlId = $(this).data("id");
        let currentStatus = $(this).data("status"); 

        Swal.fire({
            title: "Update Status",
            showCancelButton: true,
            confirmButtonText: currentStatus ? "🔴 Deactivate" : "🟢 Activate",
            showDenyButton: false
        }).then((result) => {
            if (result.isConfirmed) {
                const newStatus = currentStatus ? 0 : 1;  // Convert boolean to 0 or 1
                
                console.log("Updating status for ID:", urlId, "New Status:", newStatus); // Debugging

                $.ajax({
                    url: `${API_BASE_URL}/api/status/update/${urlId}/`,
                    method: "PUT",
                    contentType: "application/json",
                    headers: { "Authorization": "Token " + getAuthToken() },
                    data: JSON.stringify({ status: newStatus }),  // Send 0 or 1 instead of true/false
                    success: function (response) {
                        console.log("Success Response:", response); // Debugging
                        showMessage("success", "Status successfully updated!");
                        loadUserUrls();
                    },
                    error: function (xhr) {
                        console.log("Error Response:", xhr.responseText); // Debugging
                        showMessage("error", "An error occurred while updating!");
                    }
                });
            }
        });
    });


    // Copy functionality
    $(document).on("click", ".copy-btn, .short-link", function (event) {
        event.preventDefault();
        let link = $(this).data("link") || $(this).text();
        navigator.clipboard.writeText(link).then(() => {
            showToast("✅ Copied: " + link);
        }).catch(() => {
            showToast("⚠️ No text found to copy!");
        });
    });

    // ======================
    // 9. INITIALIZATION
    // ======================
    loadUserUrls();
});