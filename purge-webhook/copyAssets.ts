import fs from "fs-extra";
(async () => {
    const copyFiles = async () => {
        try {
            await fs.copy('src/public', 'dist/public')
        } catch (err) {
            console.error(err)
        }
    };
    copyFiles();
})()