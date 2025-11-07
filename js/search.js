document.addEventListener('DOMContentLoaded', function() {
    const searchBox = document.getElementById('searchBox');
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const searchResults = document.getElementById('searchResults');

    // Sample product data - in a real application, this would come from your backend
    const products = [
        { id: 1, name: 'Winter Jacket', category: 'Outerwear', price: 129.99, image: 'img/img/img1.jpeg', url: 'product-details.html?id=1' },
        { id: 2, name: 'Knit Sweater', category: 'Tops', price: 59.99, image: 'img/img/img2.jpeg', url: 'product-details.html?id=2' },
        { id: 3, name: 'Wool Scarf', category: 'Accessories', price: 34.99, image: 'img/img/img3.jpeg', url: 'product-details.html?id=3' },
        { id: 4, name: 'Leather Gloves', category: 'Accessories', price: 45.99, image: 'img/img/img4.jpeg', url: 'product-details.html?id=4' },
        { id: 5, name: 'Snow Boots', category: 'Footwear', price: 89.99, image: 'img/img/men_7.jpeg', url: 'product-details.html?id=5' },
        { id: 6, name: 'Thermal Leggings', category: 'Bottoms', price: 39.99, image: 'img/img/men_1.jpeg', url: 'product-details.html?id=6' },
        { id: 7, name: 'Beanie Hat', category: 'Accessories', price: 24.99, image: 'img/img/men_2.jpeg', url: 'product-details.html?id=7' },
        { id: 8, name: 'Puffer Vest', category: 'Outerwear', price: 79.99, image: 'img/img/men_3.jpeg', url: 'product-details.html?id=8' }
    ];

    // Handle search button click
    searchButton.addEventListener('click', function(e) {
        e.preventDefault();
        performSearch();
    });

    // Handle search when pressing Enter in the search input
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            performSearch();
        }
    });

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm.length < 1) {
            searchResults.classList.remove('active');
            return;
        }

        // Filter products based on search term
        const filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) || 
            product.category.toLowerCase().includes(searchTerm)
        );
        
        displaySearchResults(filteredProducts, searchTerm);
    }

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchBox.contains(e.target)) {
            searchResults.classList.remove('active');
        }
    });

    // Prevent closing when clicking inside search results
    searchResults.addEventListener('click', function(e) {
        e.stopPropagation();
    });

    // Display search results
    function displaySearchResults(products, searchTerm) {
        if (products.length === 0) {
            searchResults.innerHTML = `
                <div class="search-result-item no-results">
                    <p>No products found for "${searchTerm}"</p>
                    <p class="small">Try a different search term</p>
                </div>
            `;
        } else {
            searchResults.innerHTML = products.map(product => `
                <a href="${product.url}" class="search-result-item">
                    <img src="${product.image}" alt="${product.name}">
                    <div class="info">
                        <h6>${product.name}</h6>
                        <p>${product.category} • $${product.price.toFixed(2)}</p>
                    </div>
                </a>
            `).join('');
        }
        searchResults.classList.add('active');
    }
});
