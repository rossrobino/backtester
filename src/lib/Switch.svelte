<!-- Component from: https://svelte.dev/repl/35d77f2ab11e4197a19ffd8e7c4ac74e?version=3.9.1 -->

<script>
    export let checked = false;
    export let id;
    export let onChange;
</script>

<label class="switch">
    <input {id} on:change={onChange} type="checkbox" bind:checked />
    <span class="slider" />
</label>
  
<style>
    .switch {
        position: relative;
        display: inline-block;
        width: 40px;
        height: 23px;
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
        background-color: rgb(0, 90, 128);
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 23px;
    }
  
    .slider:before {
        position: absolute;
        content: "";
        height: 17px;
        width: 17px;
        left: 3px;
        bottom: 3px;
        background-color: white;
        -webkit-transition: 0.4s;
        transition: 0.4s;
        border-radius: 50%;
    }
  
    input:checked + .slider {
        background-color: goldenrod;
    }
  
    input:checked + .slider:before {
        -webkit-transform: translateX(17px);
        -ms-transform: translateX(17px);
        transform: translateX(17px);
    }
</style>