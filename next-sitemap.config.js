/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://pdfwrite.vercel.app', // 👈 your live site URL
  generateRobotsTxt: true, // (optional) generate robots.txt
  sitemapSize: 7000, // optional, number of URLs per sitemap
  changefreq: 'daily', // optional: how often pages are likely to change
  priority: 0.9, // default priority
  exclude: ['/admin/*', '/private-page'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: 'BadBot', disallow: ['/'] },
    ],
  },
};
