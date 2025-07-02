import { http, HttpResponse } from 'msw';
import { faker } from '@faker-js/faker';

// Mock data generators
const generateMockUser = () => ({
  id: faker.string.uuid(),
  email: faker.internet.email(),
  user_metadata: {
    full_name: faker.person.fullName(),
    avatar_url: faker.image.avatar(),
  },
});

const generateMockAudioSubmission = () => ({
  id: faker.string.uuid(),
  user_id: faker.string.uuid(),
  title: faker.music.songName(),
  artist: faker.person.fullName(),
  duration: faker.number.int({ min: 30, max: 300 }),
  storage_path: `audio/${faker.string.uuid()}.mp3`,
  created_at: faker.date.recent().toISOString(),
  votes: faker.number.int({ min: 0, max: 100 }),
});

export const handlers = [
  // Auth endpoints
  http.post('https://*.supabase.co/auth/v1/token', async () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      token_type: 'bearer',
      expires_in: 3600,
      refresh_token: 'mock-refresh-token',
      user: generateMockUser(),
    });
  }),

  // Audio submissions
  http.get('https://*.supabase.co/rest/v1/audio_submissions', () => {
    return HttpResponse.json(
      Array.from({ length: 5 }, generateMockAudioSubmission)
    );
  }),

  // Storage upload
  http.post('https://*.supabase.co/storage/v1/object/audio-submissions/*', () => {
    return HttpResponse.json({
      Key: `audio-submissions/${faker.string.uuid()}.mp3`,
    });
  }),

  // Catch-all for unhandled requests
  http.all('*', ({ request }) => {
    console.warn(`Unhandled request: ${request.method} ${request.url}`);
    return new HttpResponse(null, { status: 404 });
  }),
];
