/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://req.jji.kr', // ✨ 실제 도메인 주소
    generateRobotsTxt: true,        // robots.txt 자동 생성
    sitemapSize: 7000,
    changefreq: 'daily',
    priority: 0.7,
  }