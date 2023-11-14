  // Function to scroll to the contact section
  function scrollToContact() {
    document.querySelector("#contact").scrollIntoView({
      behavior: "smooth"
    });
  }

  // Check if the URL contains a hash fragment (e.g., #contact) and scroll to it
  window.addEventListener("DOMContentLoaded", () => {
    const hash = window.location.hash;
    if (hash === "#contact") {
      scrollToContact();
    }
  });

     