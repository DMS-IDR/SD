

export const saveToLocalStorage = (key, data) => {
    if (typeof data === 'string') {
        localStorage.setItem(key, data);
    } else {
        const serializedValue = JSON.stringify(data);
        localStorage.setItem(key, serializedValue);
    }
}

export const getFromLocalStorage = (key) => {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : null;
    } catch (e) {
        return item;
    }
}

export const deleteLocalStorage = () => {
    localStorage.clear();
}
