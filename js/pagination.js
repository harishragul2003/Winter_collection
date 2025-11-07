/**
 * pagination.js - Handles pagination functionality for the collections page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const ITEMS_PER_PAGE = 6; // Number of items to show per page
    const collectionsContainer = document.querySelector('#featured-collections .row.g-4');
    const pagination = document.querySelector('.pagination');
    
    if (!collectionsContainer || !pagination) return;
    
    // Get all collection items
    const allCollections = Array.from(collectionsContainer.querySelectorAll('.col-md-4'));
    const totalPages = Math.ceil(allCollections.length / ITEMS_PER_PAGE);
    let currentPage = 1;
    
    // Initialize pagination
    function initPagination() {
        // Update pagination controls
        updatePaginationControls();
        
        // Show first page by default
        showPage(1);
        
        // Add event listeners to pagination controls
        setupPaginationEventListeners();
    }
    
    // Show a specific page
    function showPage(pageNumber) {
        // Validate page number
        if (pageNumber < 1) pageNumber = 1;
        if (pageNumber > totalPages) pageNumber = totalPages;
        
        currentPage = pageNumber;
        
        // Calculate start and end index for items to show
        const startIndex = (pageNumber - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        
        // Hide all collections
        allCollections.forEach(collection => {
            collection.style.display = 'none';
        });
        
        // Show collections for current page
        const currentItems = allCollections.slice(startIndex, endIndex);
        currentItems.forEach(item => {
            item.style.display = 'block';
            // Add fade-in animation
            item.style.animation = 'fadeIn 0.5s ease-in-out';
        });
        
        // Update pagination controls
        updatePaginationControls();
        
        // Scroll to top of collections
        collectionsContainer.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Update pagination controls
    function updatePaginationControls() {
        const pageItems = pagination.querySelectorAll('.page-item');
        const prevButton = pagination.querySelector('[data-page="prev"]').closest('.page-item');
        const nextButton = pagination.querySelector('[data-page="next"]').closest('.page-item');
        
        // Update active state
        pageItems.forEach(item => {
            const pageLink = item.querySelector('.page-link');
            const pageNumber = parseInt(pageLink.dataset.page);
            
            if (!isNaN(pageNumber)) {
                item.classList.toggle('active', pageNumber === currentPage);
            }
        });
        
        // Update prev/next buttons
        prevButton.classList.toggle('disabled', currentPage === 1);
        nextButton.classList.toggle('disabled', currentPage === totalPages);
    }
    
    // Set up event listeners for pagination
    function setupPaginationEventListeners() {
        // Handle page number clicks
        pagination.addEventListener('click', function(e) {
            e.preventDefault();
            
            const target = e.target.closest('.page-link');
            if (!target) return;
            
            const pageAction = target.dataset.page;
            
            if (pageAction === 'prev') {
                if (currentPage > 1) showPage(currentPage - 1);
            } else if (pageAction === 'next') {
                if (currentPage < totalPages) showPage(currentPage + 1);
            } else if (!isNaN(parseInt(pageAction))) {
                showPage(parseInt(pageAction));
            }
        });
    }
    
    // Initialize the pagination
    initPagination();
});
