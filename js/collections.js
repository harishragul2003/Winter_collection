/**
 * collections.js - Handles the View Collections button functionality
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get all View Collections buttons
    const viewCollectionsButtons = document.querySelectorAll('.view-collections-btn');
    
    // Add click event listener to each button
    viewCollectionsButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Prevent default anchor behavior
            e.preventDefault();
            
            // Add a smooth transition effect
            this.classList.add('btn-clicked');
            
            // Navigate to the collections page after a short delay for animation
            setTimeout(() => {
                window.location.href = 'collections.html';
            }, 300);
        });
        
        // Add hover effect
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
        });
    });
});
