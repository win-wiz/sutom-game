export default function sitemap() {
    return [
        {
            url: 'https://sutom.fun',
            lastModified: new Date().toISOString(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: 'https://sutom.fun/privacy',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: 'https://sutom.fun/terms',
            lastModified: new Date().toISOString(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
    ];
} 