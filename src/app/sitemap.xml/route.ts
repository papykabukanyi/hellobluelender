import { NextResponse } from 'next/server';

export async function GET() {
  const baseUrl = 'https://empire-entreprise.com';
  const currentDate = new Date().toISOString();
  
  // Only include public pages in sitemap
  const staticPages = [
    { url: '', priority: '1.0', changefreq: 'daily' },
    { url: '/about', priority: '0.8', changefreq: 'monthly' },
    { url: '/contact', priority: '0.8', changefreq: 'monthly' },
    { url: '/products', priority: '0.9', changefreq: 'weekly' },
    { url: '/products/equipment-financing', priority: '0.8', changefreq: 'weekly' },
    { url: '/products/working-capital', priority: '0.8', changefreq: 'weekly' },
    { url: '/products/sba-loans', priority: '0.8', changefreq: 'weekly' },
    { url: '/products/business-expansion', priority: '0.8', changefreq: 'weekly' },
    { url: '/industries', priority: '0.7', changefreq: 'weekly' },
    { url: '/apply', priority: '0.9', changefreq: 'daily' },
  ];
  
  // Industry-specific pages
  const industries = [
    'restaurant', 'construction', 'healthcare', 'retail', 'manufacturing',
    'transportation', 'technology', 'beauty', 'automotive', 'real-estate',
    'agriculture', 'professional-services'
  ];
  
  const industryPages = industries.map(industry => ({
    url: `/industries/${industry}`,
    priority: '0.7',
    changefreq: 'weekly'
  }));
  
  const allPages = [...staticPages, ...industryPages];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=3600, s-maxage=3600'
    }
  });
}
