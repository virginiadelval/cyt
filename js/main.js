
/* ============================================================
   PORTAL INSTITUCIONAL
   JavaScript principal
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {


        /* ====================================================
           FILTRO DE VISORS
           ==================================================== */

        const filterButtons =
            document.querySelectorAll(
                ".filter-button"
            );


        const visorCards =
            document.querySelectorAll(
                ".visor-card"
            );


        filterButtons.forEach(
            button => {

                button.addEventListener(
                    "click",
                    () => {


                        /* ------------------------------------
                           BOTÓN ACTIVO
                           ------------------------------------ */

                        filterButtons.forEach(
                            item => {

                                item.classList.remove(
                                    "active"
                                );

                            }
                        );


                        button.classList.add(
                            "active"
                        );


                        /* ------------------------------------
                           CATEGORÍA
                           ------------------------------------ */

                        const filter =
                            button.dataset.filter;


                        /* ------------------------------------
                           FILTRAR CARDS
                           ------------------------------------ */

                        visorCards.forEach(
                            card => {

                                const category =
                                    card.dataset.category;


                                if (
                                    filter === "todos" ||
                                    category === filter
                                ) {

                                    card.classList.remove(
                                        "hidden"
                                    );

                                } else {

                                    card.classList.add(
                                        "hidden"
                                    );

                                }

                            }
                        );

                    }
                );

            }
        );


        /* ====================================================
           MENÚ MOBILE
           ==================================================== */

        const menuToggle =
            document.getElementById(
                "menu-toggle"
            );


        const mainNav =
            document.querySelector(
                ".main-nav"
            );


        if (
            menuToggle &&
            mainNav
        ) {

            menuToggle.addEventListener(
                "click",
                () => {

                    const isOpen =
                        mainNav.classList.toggle(
                            "open"
                        );


                    menuToggle.setAttribute(
                        "aria-expanded",
                        isOpen
                    );

                }
            );


            /* ----------------------------------------------
               CERRAR MENÚ AL HACER CLICK
               ---------------------------------------------- */

            mainNav
                .querySelectorAll("a")
                .forEach(
                    link => {

                        link.addEventListener(
                            "click",
                            () => {

                                mainNav.classList.remove(
                                    "open"
                                );

                                menuToggle.setAttribute(
                                    "aria-expanded",
                                    "false"
                                );

                            }
                        );

                    }
                );

        }


        /* ====================================================
           CERRAR MENÚ AL CAMBIAR TAMAÑO
           ==================================================== */

        window.addEventListener(
            "resize",
            () => {

                if (
                    window.innerWidth > 760 &&
                    mainNav
                ) {

                    mainNav.classList.remove(
                        "open"
                    );


                    if (menuToggle) {

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                }

            }
        );


        /* ====================================================
           ANIMACIÓN SUAVE DE ENTRADA DE CARDS
           ==================================================== */

        const cards =
            document.querySelectorAll(
                ".visor-card"
            );


        if (
            "IntersectionObserver"
            in window
        ) {

            const observer =
                new IntersectionObserver(
                    entries => {

                        entries.forEach(
                            entry => {

                                if (
                                    entry.isIntersecting
                                ) {

                                    entry.target.classList.add(
                                        "visible"
                                    );

                                    observer.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },
                    {
                        threshold: 0.12
                    }
                );


            cards.forEach(
                card => {

                    observer.observe(
                        card
                    );

                }
            );

        }


        /* ====================================================
           ESC PARA CERRAR MENÚ
           ==================================================== */

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    mainNav
                ) {

                    mainNav.classList.remove(
                        "open"
                    );


                    if (menuToggle) {

                        menuToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }

                }

            }
        );


        /* ====================================================
           LOG
           ==================================================== */

        console.log(
            "Portal institucional iniciado correctamente."
        );

    }
);
