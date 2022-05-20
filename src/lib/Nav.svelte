<script>
    export let title = "Backtracker";
</script>

<nav>
    <h1>{title}</h1>
</nav>

<style>
    h1 {
        font-size: 7vw;
        color: rgb(255, 255, 255);
    }
    nav {
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 2.65vw 0 9vw 0;
        height: 9vw;
        text-align: center;
        background-color: rgb(0, 90, 128);
        transform: skewY(-3deg);
    }
    @media (max-width: 1007px) {
        h1 {
            font-size: 10vw;
        }
        nav {
            height: 15vw;
        }
    }
    @media (max-width: 640px) {
        h1 {
            font-size: 12vw;
        }
        nav {
            height: 20vw;
        }
    }
</style>