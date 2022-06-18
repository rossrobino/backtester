<!-- Component from: https://svelte.dev/repl/35d77f2ab11e4197a19ffd8e7c4ac74e?version=3.9.1 -->

<script>
    export let checked = false;
    export let id = undefined;
</script>

<label class="switch">
    <input {id} on:change type="checkbox" bind:checked />
    <span class="slider" />
</label>
  
<style>
    .switch {
        position: relative;
        display: inline-block;
        width: 3rem;
        height: 1.7rem;
    }
  
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
  
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: 0.3s;
        transition: 0.3s;
        border-radius: 1.7rem;
    }
  
    .slider:before {
        position: absolute;
        content: "";
        height: 1.3rem;
        width: 1.3rem;
        left: .2rem;
        bottom: .2rem;
        background-color: white;
        -webkit-transition: 0.3s;
        transition: 0.3s;
        border-radius: 50%;
    }
  
    input:checked + .slider {
        background-color: rgb(252,191,84);
    }
  
    input:checked + .slider:before {
        -webkit-transform: translateX(1.3rem);
        -ms-transform: translateX(1.3rem);
        transform: translateX(1.3rem);
    }
</style>