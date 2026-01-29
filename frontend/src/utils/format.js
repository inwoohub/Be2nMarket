export function formatPrice(price) {
    if (price === null || price === undefined) return "";
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + "원";
}

export function formatTime(timeString) {
    if (!timeString) return "";
    const date = new Date(timeString);
    let hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${ampm} ${hours}:${minutes}`;
}

export function formatDate(timeString) {
    if (!timeString) return "";
    return timeString.substring(0, 10);
}

export function formatTimeShort(timeString) {
    if (!timeString) return "";
    return timeString.substring(11, 16);
}

export function getSafeImageUrl(url) {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    if (url.startsWith('/')) return url;
    return `/${url}`;
}
