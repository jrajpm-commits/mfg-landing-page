(function() {
    // Check if the user is authenticated via session storage.
    const isAuthenticated = sessionStorage.getItem('isAuthenticated');

    // If not authenticated, redirect to the login page.
    // The check for 'login.html' in the path prevents an infinite redirect loop.
    if (isAuthenticated !== 'true' && !window.location.pathname.endsWith('login.html')) {
        // Redirect to the login page.
        window.location.href = 'login.html';
    }
})();