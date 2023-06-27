<script>
    import {navigate} from 'svelte-routing';

    // Define an array of pages to display in the navbar
    const pages = [
        {title: 'Home', route: '/'},
        {title: 'Commands', route: '/commands'},
        {title: 'Settings', route: '/settings'},
        // Add additional pages here as needed
    ];

    // Handle clicking a navbar link
    function handlePageClick(route) {
        navigate(route);
    }

    // Handle clicking the login button
    function handleLoginClick() {
        // redirect to the login page
        navigate('/login');
        location.reload();
    }
</script>

<link rel="stylesheet" href="index.css">

<div class="navbar">
    <div class="navbar-left">
        <!-- Display each page link in the navbar -->
        {#each pages as page}
            <div class="navbar-link" on:click={() => handlePageClick(page.route)}>
                {page.title}
            </div>
        {/each}
    </div>
    <div class="navbar-top">
        <div class="navbar-title">Discord Suggestion Bot</div>
        <div class="navbar-right">
            <button class="login-button" on:click={handleLoginClick}>Login</button>
        </div>
    </div>
</div>

<div class="content">
    <!--<h1>Discord Suggestion Bot</h1>-->
    <p>Looking for a way to suggest new ideas for your Discord server? Look no further than our Suggestion-Bot!</p>

    <div class="features">
        <div class="feature">
            <img src="img/feature-1.png" alt="Feature 1">
            <h3>Simple and intuitive interface</h3>
            <p>Our bot is designed to be easy to use, with a straightforward interface that anyone can understand.</p>
        </div>
        <div class="feature">
            <img src="img/feature-2.png" alt="Feature 2">
            <h3>Customizable settings</h3>
            <p>Configure the bot to suit your server's needs, with options for voting, moderation, and more.</p>
        </div>
        <div class="feature">
            <img src="img/feature-3.png" alt="Feature 3">
            <h3>Powerful suggestion management</h3>
            <p>View and manage all suggestions in one place, with advanced search and filtering options.</p>
        </div>
    </div>

    <a href="#" class="button">Get started today!</a>
</div>
