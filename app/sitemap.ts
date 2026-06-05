import { MetadataRoute } from 'next'
 
export default function sitemap(): MetadataRoute.Sitemap {
  const stations = ['hindi', 'bagheli', 'bundeli', 'chhattisgarhi', 'malwi', 'sarguja', 'bastar', 'raigarh', 'punjabi', 'news']
  
  const stationRoutes = stations.map(station => ({
    url: `https://thefutureradio.com/radio/${station}`,
    lastModified: new Date(),
    changeFrequency: 'always' as const,
    priority: 0.8,
  }))

  return [
    {
      url: 'https://thefutureradio.com',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 1.0,
    },
    {
      url: 'https://thefutureradio.com/radio',
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9,
    },
    {
      url: 'https://thefutureradio.com/bagheli',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: 'https://thefutureradio.com/business',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: 'https://thefutureradio.com/creators',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...stationRoutes,
  ]
}
