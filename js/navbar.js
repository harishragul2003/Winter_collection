// Navbar scroll effect
window.addEventListener('DOMContentLoaded', function() {
    const navbar = document.querySelector('.navbar');
    const navbarHeight = 70; // Height of the navbar when expanded
    
    // Add scrolled class on scroll
    window.addEventListener('scroll', function() {
        if (window.scrollY > navbarHeight) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Mobile menu button animation
    const navbarToggler = document.querySelector('.navbar-toggler');
    if (navbarToggler) {
        navbarToggler.addEventListener('click', function() {
            this.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking a nav link
    const navLinks = document.querySelectorAll('.nav-link');
    const menuCollapse = document.querySelector('.navbar-collapse');
    const bsCollapse = new bootstrap.Collapse(menuCollapse, {toggle: false});
    
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuCollapse.classList.contains('show')) {
                bsCollapse.toggle();
            }
        });
    });

    // Add active class to current page link
    const currentPage = location.pathname.split('/').pop() || 'index.html';
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
});
