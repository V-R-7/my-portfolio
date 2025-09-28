 document.addEventListener('DOMContentLoaded', function() {
            // Get all sections and nav links
            const sections = document.querySelectorAll('section[id]');
            const navLinks = document.querySelectorAll('.nav-link');
            
            // Function to get current section in view
            function getCurrentSection() {
                const scrollY = window.pageYOffset;
                const headerHeight = document.querySelector('.header').offsetHeight;
                const windowHeight = window.innerHeight;
                
                // Check if we're at the bottom of the page (contact section)
                if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight - 50) {
                    return 'contact';
                }
                
                for (let i = sections.length - 1; i >= 0; i--) {
                    const section = sections[i];
                    const sectionTop = section.getBoundingClientRect().top + scrollY - headerHeight - 50;
                    const sectionBottom = sectionTop + section.offsetHeight;
                    
                    if (scrollY >= sectionTop && scrollY < sectionBottom) {
                        return section.getAttribute('id');
                    }
                }
                
                return 'home'; // Default to home
            }
            
            // Function to update active nav link
            function updateActiveNavLink() {
                const currentSection = getCurrentSection();
                
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${currentSection}`) {
                        link.classList.add('active');
                    }
                });
            }
            
            // Function to scroll to section accounting for fixed header
            function scrollToSection(elementId) {
                const element = document.getElementById(elementId);
                if (!element) return;
                
                const header = document.querySelector('.header');
                const headerOffset = header.offsetHeight;
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }

            // Navigation link handling
            navLinks.forEach(link => {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    
                    // Get the target section id from href
                    const sectionId = this.getAttribute('href').substring(1);
                    scrollToSection(sectionId);
                });
            });

            // Scroll event listener for auto-active menu
            let ticking = false;
            
            function handleScroll() {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        updateActiveNavLink();
                        ticking = false;
                    });
                    ticking = true;
                }
            }
            
            window.addEventListener('scroll', handleScroll);
            
            // Initial call to set active link on page load
            updateActiveNavLink();

            // Featured cards hover effect
            const featuredCards = document.querySelectorAll('.featured-card');
            featuredCards.forEach(card => {
                card.addEventListener('mouseenter', function() {
                    this.style.transform = 'translateY(-8px)';
                });
                
                card.addEventListener('mouseleave', function() {
                    this.style.transform = 'translateY(-5px)';
                });
            });

            // Course items click effect
            const courseItems = document.querySelectorAll('.course-item');
            courseItems.forEach(item => {
                item.addEventListener('click', function() {
                    this.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        this.style.transform = 'scale(1)';
                    }, 150);
                });
            });

            // Settings icon functionality
            const settingsIcon = document.querySelector('.settings-icon');
            if (settingsIcon) {
                settingsIcon.addEventListener('click', function() {
                    this.style.transform = this.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
                });
            }
        });

        // Handle other anchor links (non-navigation)
        document.querySelectorAll('a[href^="#"]:not(.nav-link)').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const target = document.getElementById(targetId);
                if (target) {
                    const header = document.querySelector('.header');
                    const headerOffset = header.offsetHeight;
                    const elementPosition = target.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    
                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            });
        });

const functionApiUrl = "http://localhost/api/GetPortfolioCounter";
// const functionApiUrl = "http://localhost:7071/api/GetPortfolioCounter";

const getVisitCount = async () => {
    try {
        const response = await fetch(functionApiUrl);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Visit count fetched:', data.Count);
        return data.Count;
    } catch (error) {
        console.error('Error fetching visit count:', error);
        return 0;
    }
};

const visitCountElement = document.getElementById('visit-count');
if (visitCountElement) {
    getVisitCount().then(count => {
        visitCountElement.textContent = count + 
            (count === 1 ? ' visit' : ' visits');
    });
}
