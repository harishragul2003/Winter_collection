document.addEventListener('DOMContentLoaded', function() {
    // Cache DOM elements
    const filterForm = document.querySelector('.filter-section');
    const productGrid = document.querySelector('.row.g-4');
    const productItems = document.querySelectorAll('.col-md-6.col-lg-4');
    const productCount = document.querySelector('.product-count');
    const sortSelect = document.getElementById('sortBy');
    
    // Initialize filter state
    const filters = {
        categories: [],
        priceRanges: [],
        sizes: [],
        colors: []
    };

    // Get all filter checkboxes
    const filterCheckboxes = document.querySelectorAll('.filter-section input[type="checkbox"]');
    
    // Add event listeners to all filter checkboxes
    filterCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', handleFilterChange);
    });
    
    // Add event listener for sort select
    if (sortSelect) {
        sortSelect.addEventListener('change', handleSortChange);
    }
    
    // Handle filter changes
    function handleFilterChange(e) {
        const filterType = e.target.name;
        const value = e.target.value;
        const isChecked = e.target.checked;
        
        // Update filters object
        if (isChecked) {
            if (!filters[filterType].includes(value)) {
                filters[filterType].push(value);
            }
        } else {
            filters[filterType] = filters[filterType].filter(item => item !== value);
        }
        
        // Apply filters
        applyFilters();
    }
    
    // Apply all active filters
    function applyFilters() {
        let visibleCount = 0;
        
        productItems.forEach(item => {
            const category = item.querySelector('.product-category').textContent.trim();
            const priceText = item.querySelector('.price:not(.text-muted)').textContent;
            const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
            const sizeElements = item.querySelectorAll('.size-badge');
            const sizes = Array.from(sizeElements).map(el => el.textContent.trim());
            const colorElements = item.querySelectorAll('.color-option');
            const colors = Array.from(colorElements).map(el => el.getAttribute('data-color'));
            
            // Check if item matches all active filters
            const matchesCategory = filters.categories.length === 0 || 
                                  filters.categories.some(filterCat => 
                                      category.toLowerCase().includes(filterCat.toLowerCase())
                                  );
            
            const matchesPrice = filters.priceRanges.length === 0 || 
                               filters.priceRanges.some(range => {
                                   const [min, max] = range.split('-').map(Number);
                                   return price >= min && price <= max;
                               });
            
            const matchesSize = filters.sizes.length === 0 || 
                              filters.sizes.some(size => 
                                  sizes.includes(size)
                              );
            
            const matchesColor = filters.colors.length === 0 || 
                               filters.colors.some(color => 
                                   colors.includes(color)
                               );
            
            // Show/hide item based on filters
            if (matchesCategory && matchesPrice && matchesSize && matchesColor) {
                item.style.display = '';
                visibleCount++;
            } else {
                item.style.display = 'none';
            }
        });
        
        // Update product count
        updateProductCount(visibleCount);
    }
    
    // Handle sort changes
    function handleSortChange() {
        const sortValue = this.value;
        const productContainer = document.querySelector('.row.g-4');
        const items = Array.from(productContainer.children);
        
        items.sort((a, b) => {
            const priceA = parseFloat(a.querySelector('.price:not(.text-muted)').textContent.replace(/[^0-9.-]+/g, ""));
            const priceB = parseFloat(b.querySelector('.price:not(.text-muted)').textContent.replace(/[^0-9.-]+/g, ""));
            
            switch(sortValue) {
                case 'price-low':
                    return priceA - priceB;
                case 'price-high':
                    return priceB - priceA;
                case 'newest':
                    // Assuming newer items have the 'New' badge
                    const isANew = a.querySelector('.product-badge.new') !== null;
                    const isBNew = b.querySelector('.product-badge.new') !== null;
                    return isANew === isBNew ? 0 : isANew ? -1 : 1;
                case 'popular':
                    // This would typically come from backend data
                    // For demo, we'll sort by a random value
                    return Math.random() - 0.5;
                default:
                    return 0;
            }
        });
        
        // Re-append sorted items
        items.forEach(item => productContainer.appendChild(item));
    }
    
    // Update the product count display
    function updateProductCount(count) {
        if (productCount) {
            productCount.textContent = `Showing ${count} of ${productItems.length} products`;
        }
    }
    
    // Initialize product count
    updateProductCount(productItems.length);
    
    // Add size badges to products (for demo purposes)
    function initializeProductSizes() {
        const sizeOptions = ['S', 'M', 'L', 'XL'];
        
        productItems.forEach(item => {
            const sizeContainer = document.createElement('div');
            sizeContainer.className = 'mt-2 size-container d-none';
            
            sizeOptions.forEach(size => {
                const sizeBadge = document.createElement('span');
                sizeBadge.className = 'badge bg-light text-dark border me-1 mb-1 size-badge';
                sizeBadge.textContent = size;
                sizeContainer.appendChild(sizeBadge);
            });
            
            item.querySelector('.product-details').insertBefore(
                sizeContainer,
                item.querySelector('.d-flex.justify-content-between')
            );
            
            // Show size container on hover
            item.addEventListener('mouseenter', () => {
                sizeContainer.classList.remove('d-none');
                sizeContainer.classList.add('d-block');
            });
            
            item.addEventListener('mouseleave', () => {
                sizeContainer.classList.remove('d-block');
                sizeContainer.classList.add('d-none');
            });
        });
    }
    
    // Initialize the page
    initializeProductSizes();
});
