import {defineConfig} from 'vite';

// Archive artwork remains in public for provenance. The postbuild step copies
// the current game's runtime set instead of shipping every historical round.
export default defineConfig({publicDir:false});
