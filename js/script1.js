// 1. Tab Switching Functionality
function showCategory(categoryId, event) {
    // Hide all sections
    document.querySelectorAll('.category-section').forEach(section => {
        section.classList.remove('active');
    });
    // Remove active class from all tabs
    document.querySelectorAll('.shop-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show the selected section and highlight the tab
    document.getElementById(categoryId).classList.add('active');
    event.currentTarget.classList.add('active');
}

// 2. Modal Popup Functionality
function openModal(button) {
    // Get the product card that was clicked
    const card = button.closest('.product-card');
    
    // Extract info from that card
    const img = card.querySelector('.product-img').src;
    const title = card.querySelector('.p-title').innerText;
    const price = card.querySelector('.product-price').innerText;

    // Populate the Modal
    document.getElementById('modalImg').src = img;
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalPrice').innerText = price;

    // Open the Bootstrap Modal
    var myModal = new bootstrap.Modal(document.getElementById('productModal'));
    myModal.show();
}
