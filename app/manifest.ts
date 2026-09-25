import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Internet of Things Club — SIET',
    short_name: 'IoT Club',
    description:
      'Student IoT, embedded systems, robotics and automation community at Sri Shakthi Institute of Engineering and Technology.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f4f6f8',
    theme_color: '#065f46',
  }
}
