import { MetadataRoute } from 'next';
import { REGIONAL_STATIONS, DEVOTIONAL_STATIONS } from '@/lib/data';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: 'https://thefutureradio.com',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1,
    },
    {
      url: 'https://thefutureradio.com/creators',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: 'https://thefutureradio.com/creators/apply',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://thefutureradio.com/business',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://thefutureradio.com/partner',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: 'https://thefutureradio.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ];

  const regionalRoutes: MetadataRoute.Sitemap = REGIONAL_STATIONS.map((station) => ({
    url: `https://thefutureradio.com/regional/${station.id}`,
    lastModified: new Date(),
    changeFrequency: 'always',
    priority: 0.9,
  }));

  const devotionalRoutes: MetadataRoute.Sitemap = DEVOTIONAL_STATIONS.map((station) => ({
    url: `https://thefutureradio.com/devotional/${station.id}`,
    lastModified: new Date(),
    changeFrequency: 'always',
    priority: 0.9,
  }));

  return [...staticRoutes, ...regionalRoutes, ...devotionalRoutes];
}
