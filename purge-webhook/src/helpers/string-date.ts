
export const stringDate = (returnIsoDate: boolean = false) => {
    const d = new Date();
    if (returnIsoDate) {
        return d.toISOString()
    } else {
        d.setHours(d.getHours() - 8);
        return `${d.getUTCMonth() + 1}-${d.getUTCDate()}-${d.getUTCFullYear()}-${d.valueOf()}`;
    }
}