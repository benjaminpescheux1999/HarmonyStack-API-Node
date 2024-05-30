document.addEventListener("DOMContentLoaded", function(event) {
    setTimeout(function () {
        document.documentElement.setAttribute('lang', 'fr');
        const markdown = document.getElementsByClassName("markdown")[0];
        const selectLanguage = document.createElement("select");
        const optionFR = document.createElement("option");
        optionFR.value = "fr";
        optionFR.textContent = "Français";
        const optionEN = document.createElement("option");
        optionEN.value = "en";
        optionEN.textContent = "English";
        selectLanguage.appendChild(optionFR);
        selectLanguage.appendChild(optionEN);
        markdown.appendChild(selectLanguage);

        selectLanguage.onchange = function() {
            document.documentElement.setAttribute('lang', selectLanguage.value);
        };

        // Intercept network requests to observe changes and modify them before sending
        const originalFetch = window.fetch;
        window.fetch = function() {
            const args = Array.from(arguments);
            if (args[1] && typeof args[1] === 'object') {
                args[1].headers = {
                    ...args[1].headers,
                    'Accept-Language': selectLanguage.value
                };
            } else {
                args[1] = {
                    headers: {
                        'Accept-Language': selectLanguage.value
                    }
                };
            }
            return originalFetch.apply(this, args).then(response => {
                return response;
            });
        };

        document.querySelectorAll(".opblock-summary").forEach(item => {
            if(item.parentElement.classList.contains("is-open")) {
                setTimeout(function () {
                    var buttons = item.parentElement.getElementsByClassName("try-out__btn");
                    if (buttons) {
                        if (!buttons[0].classList.contains("cancel")) {
                            buttons[0].click();
                        }
                    }
                },
                100);
            }

            item.addEventListener("click",() => {
                setTimeout(function () {
                    var buttons = item.parentElement.getElementsByClassName("try-out__btn");
                    if (buttons) {
                        if (!buttons[0].classList.contains("cancel")) {
                            buttons[0].click();
                        }
                    }
                },
                100);
            });
        });
    },
    1500);
});

