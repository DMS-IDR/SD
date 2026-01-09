

export const saveToLocalStorage = (key, data) => {
    const serializedValue = JSON.stringify(data);
    localStorage.setItem(key, serializedValue);
}

export const getToLocalStorage = (key) => {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
}

