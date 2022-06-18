<script>
    export let min = 0;
    export let max = 100;
    export let value = 0;
    export let step = 1;
    export let id;
    export let thumbColor = '#aaa';
    export let thumbDiameter = '1.3rem';

    // progress gradient colors from left to right
    export let color1 = '#ccc';
    export let color2 = '#ccc';
    export let color3 = '#ccc';
    export let color4 = '#ccc';

    /* 
        left and right progress gradient colors
        https://stackoverflow.com/questions/18389224/how-to-style-html5-range-input-to-have-different-color-before-and-after-slider
        dargue3
        6/2/22
    */
    let backgroundStyle;
    $: backgroundVal = (value-min)/(max-min)*100;
    $: backgroundStyle = 'linear-gradient(to right, ' + color1 + ' 0%, ' + color2 + ' ' + backgroundVal + '%, ' + color3 + ' ' + backgroundVal + '%, ' + color4 + ' 100%)';
</script>

<input 
    type='range' 
    bind:value
    {min} 
    {max} 
    {step} 
    {id} 
    name={id} 
    on:change
    style='
        --thumbColor: {thumbColor};
        --backgroundStyle: {backgroundStyle};
        --thumbDiameter: {thumbDiameter};
    '
>

<style>
    input {
        -webkit-appearance: none;
        height: .4rem;
        width: 100%;
        background: var(--backgroundStyle);
        border-radius: 1rem;
    }
    input::-webkit-slider-thumb {
        -webkit-appearance: none;
        border: none;
        background-color: var(--thumbColor);
        height: var(--thumbDiameter);
        width: var(--thumbDiameter);
        border-radius: 50%;
    }
    input::-moz-range-thumb {
        border: none;
        background-color: var(--thumbColor);
        height: var(--thumbDiameter);
        width: var(--thumbDiameter);
        border-radius: 50%;
    }
    input::-webkit-slider-runnable-track {
        background: transparent;
        border-radius: 50%;
    }
    input::-moz-range-track {
        background: transparent;
    }
</style>