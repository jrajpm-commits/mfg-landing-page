// Simple animation for cards on scroll
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.tech-card, .solution-card, .feature-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });
    
    cards.forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });
    
    // Login button functionality (simulated)
    document.querySelector('.auth-buttons .btn-outline').addEventListener('click', function() {
        alert('Secure login portal would open here with multi-factor authentication.');
        // In a real implementation, this would redirect to a login page
    });
    
    // Add interactive elements for the tech cards
    const techCards = document.querySelectorAll('.tech-card');
    techCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-15px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-10px) scale(1)';
        });
    });
});
// Contact form handling
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    const submitBtn = document.getElementById('submit-btn');
    const submitText = document.getElementById('submit-text');
    const submitSpinner = document.getElementById('submit-spinner');
    const formMessage = document.getElementById('form-message');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Show loading state
            submitText.style.display = 'none';
            submitSpinner.style.display = 'block';
            submitBtn.disabled = true;
            
            // Basic validation
            const requiredFields = contactForm.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.style.borderColor = '#ff3860';
                } else {
                    field.style.borderColor = '';
                }
            });
            
            if (!isValid) {
                showMessage('Please fill in all required fields.', 'error');
                submitText.style.display = 'block';
                submitSpinner.style.display = 'none';
                submitBtn.disabled = false;
                return;
            }
            
            // Honeypot check
            const honeypot = document.getElementById('website').value;
            if (honeypot) {
                // Bot detected - silently succeed
                showMessage('Thank you for your message! We will get back to you soon.', 'success');
                contactForm.reset();
                submitText.style.display = 'block';
                submitSpinner.style.display = 'none';
                submitBtn.disabled = false;
                return;
            }
            
            try {
                const formData = new FormData(contactForm);
                
                // Send to Formspree
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });
                
                if (response.ok) {
                    showMessage('Thank you for your message! We will get back to you within 24 hours.', 'success');
                    contactForm.reset();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Sorry, there was an error sending your message. Please try again or email us directly at manufacturing@nexustech.com', 'error');
            } finally {
                submitText.style.display = 'block';
                submitSpinner.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
        
        function showMessage(message, type) {
            formMessage.textContent = message;
            formMessage.style.display = 'block';
            formMessage.className = type; // 'success' or 'error'
            
            if (type === 'success') {
                formMessage.style.color = '#00ff9d';
            } else {
                formMessage.style.color = '#ff3860';
            }
            
            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(() => {
                    formMessage.style.display = 'none';
                }, 5000);
            }
        }
        
        // Real-time validation
        const inputs = contactForm.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                if (this.hasAttribute('required') && !this.value.trim()) {
                    this.style.borderColor = '#ff3860';
                } else {
                    this.style.borderColor = '';
                }
            });
        });
    }
});