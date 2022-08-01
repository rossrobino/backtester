import { sveltekit } from '@sveltejs/kit/vite';

/** @type {import('vite').UserConfig} */
const config = {
        plugins: [sveltekit()],
        define: {
                'process.env': process.env
        },
        ssr: {
		noExternal: ['@fortawesome/free-solid-svg-icons']
	}
};

export default config;