// EMERGENCY FIX FOR SCROLL VISIBILITY ISSUE
console.log('🚨 EMERGENCY FIX: Loading emergency content reveal...');

// Show all content immediately - no animations
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 EMERGENCY: DOM loaded, revealing all content...');
    
    const hiddenElements = document.querySelectorAll(
        '.learntav-value-card, .learntav-service-card, .learntav-testimonial-card'
    );
    
    console.log('📊 EMERGENCY: Found', hiddenElements.length, 'elements to reveal');
    
    hiddenElements.forEach((el, index) => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'none';
        console.log('✅ EMERGENCY: Revealed element', index, el.className);
    });
    
    console.log('🎉 EMERGENCY: All content revealed!');
});

// Also run immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    console.log('⏳ EMERGENCY: DOM still loading, waiting...');
} else {
    console.log('⚡ EMERGENCY: DOM already loaded, running fix now...');
    const hiddenElements = document.querySelectorAll(
        '.learntav-value-card, .learntav-service-card, .learntav-testimonial-card'
    );
    hiddenElements.forEach(el => {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.style.transition = 'none';
    });
}