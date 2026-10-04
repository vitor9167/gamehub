import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class IgdbService {
  constructor(private readonly http: HttpService) {}

  private accessToken: string | null = null;
  private tokenExpiresAt = 0;

  private async getAccessToken(): Promise<string> {
    const now = Date.now();

    if (this.accessToken && now < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const clientId = process.env.IGDB_CLIENT_ID;
    const clientSecret = process.env.IGDB_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      throw new InternalServerErrorException(
        'Credenciais da IGDB não configuradas.',
      );
    }

    const response = await firstValueFrom(
      this.http.post(
        'https://id.twitch.tv/oauth2/token',
        null,
        {
          params: {
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'client_credentials',
          },
        },
      ),
    );

    const token = response.data.access_token;

if (!token) {
  throw new InternalServerErrorException(
    'Não foi possível obter o token da Twitch.',
  );
}

this.accessToken = token;

this.tokenExpiresAt =
  now + (response.data.expires_in - 60) * 1000;

return token;
  }

  async searchGames(search: string) {
  const query = search?.trim();

  if (!query) {
    return [];
  }

  const accessToken = await this.getAccessToken();
    const response = await firstValueFrom(
      this.http.post(
        'https://api.igdb.com/v4/games',
        `
          search "${query}";
          fields
          id,
          name,
          slug,
          summary,
          first_release_date,
          rating,
          total_rating,
          cover.url,
          genres.name,
          platforms.name;
          limit 10;
        `,
        {
          headers: {
            'Client-ID': process.env.IGDB_CLIENT_ID,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      ),
    );

    return response.data;
  }

  async getGameById(id: number) {
  const accessToken = await this.getAccessToken();

  const response = await firstValueFrom(
    this.http.post(
      'https://api.igdb.com/v4/games',
      `
        where id = ${id};
        fields
          id,
          name,
          slug,
          summary,
          first_release_date,
          rating,
          total_rating,
          cover.url,
          genres.name,
          platforms.name,
          involved_companies.company.name,
          involved_companies.developer,
          involved_companies.publisher;
        limit 1;
      `,
      {
        headers: {
          'Client-ID': process.env.IGDB_CLIENT_ID!,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    ),
  );

  return response.data[0] ?? null;
}
}